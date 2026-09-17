
import '@/lib/google-auth-patch';
import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { invalidateCache } from '@/lib/dados';

const SPREADSHEET_ID = process.env.SPREADSHEET_ID?.replace(/^["']|["']$/g, '');
const TEMPLATE_SHEET_NAME = 'Modelo';

const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.replace(/^["']|["']$/g, '');
const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n');

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: clientEmail,
    private_key: privateKey,
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

async function ensureSheetExists(sheetName: string): Promise<{ sheetId: number, actualName: string, rowCount: number }> {
    if (!SPREADSHEET_ID) throw new Error('O ID da planilha (SPREADSHEET_ID) não está configurado.');

    const spreadsheetMeta = await sheets.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID
    });

    const existingSheet = spreadsheetMeta.data.sheets?.find(s => 
        s.properties?.title?.toLowerCase().trim() === sheetName.toLowerCase().trim()
    );

    if (!existingSheet || existingSheet.properties?.sheetId == null) {
        const templateSheet = spreadsheetMeta.data.sheets?.find(s => s.properties?.title === TEMPLATE_SHEET_NAME);
        if (!templateSheet || templateSheet.properties?.sheetId == null) {
            throw new Error(`A aba modelo "${TEMPLATE_SHEET_NAME}" não foi encontrada para criar a nova aba "${sheetName}".`);
        }
        const duplicateRes = await sheets.spreadsheets.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            requestBody: {
                requests: [{
                    duplicateSheet: {
                        sourceSheetId: templateSheet.properties.sheetId,
                        newSheetName: sheetName,
                    },
                }],
            },
        });

        const createdId = duplicateRes.data.replies?.[0]?.duplicateSheet?.properties?.sheetId;
        if (createdId != null) {
            const rowCount = duplicateRes.data.replies?.[0]?.duplicateSheet?.properties?.gridProperties?.rowCount || 1000;
            return { sheetId: createdId, actualName: sheetName, rowCount };
        }

        const updatedMeta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
        const created = updatedMeta.data.sheets?.find(s => 
            s.properties?.title?.toLowerCase().trim() === sheetName.toLowerCase().trim()
        );
        return { 
            sheetId: created?.properties?.sheetId ?? 0, 
            actualName: created?.properties?.title ?? sheetName,
            rowCount: created?.properties?.gridProperties?.rowCount || 1000
        };
    }

    return { 
        sheetId: existingSheet.properties.sheetId, 
        actualName: existingSheet.properties.title || sheetName,
        rowCount: existingSheet.properties.gridProperties?.rowCount || 1000
    };
}


export async function POST(req: NextRequest) {
  try {
    const { quote, intro, conclusion, description, music, author, category, subCategory, sheetName } = await req.json();

    if (!quote || !category || !sheetName) {
      return NextResponse.json({ error: 'Frase, categoria e nome da aba são obrigatórios.' }, { status: 400 });
    }

    if (!SPREADSHEET_ID) {
        return NextResponse.json({ error: 'O ID da planilha (SPREADSHEET_ID) não está configurado.' }, { status: 500 });
    }

    // Garante que a aba existe antes de tentar adicionar a linha e obtém o sheetId, o nome real da aba e o total de linhas da grade.
    const { sheetId: targetSheetId, actualName: resolvedSheetName, rowCount: currentGridRowCount } = await ensureSheetExists(sheetName);
    
    // Buscar dados atuais para determinar o próximo ID e a linha vazia
    const currentDataResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `'${resolvedSheetName}'!A:G`,
    });
    
    const rows = currentDataResponse.data.values || [];
    let nextId = 1;
    let targetRowIndex = rows.length + 1; // Default to end of rows
    
    if (rows.length > 1) {
        let foundEmpty = false;
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            const quoteText = row[6]?.toString().trim();
            const idVal = parseInt(row[0]);
            
            if (!isNaN(idVal) && idVal >= nextId) {
                nextId = idVal + 1;
            }
            
            if (!quoteText && !foundEmpty) {
                targetRowIndex = i + 1;
                foundEmpty = true;
            }
        }
        if (!foundEmpty) {
            targetRowIndex = rows.length + 1;
        }
    } else if (rows.length === 1) {
        targetRowIndex = 2;
    }

    // Obter data/hora atual e ajustar para o fuso de Brasília (UTC-3)
    const now = new Date();
    const brasiliaTime = new Date(now.valueOf() - 3 * 60 * 60 * 1000);

    // Formato YYYY-MM-DD
    const formattedDate = brasiliaTime.toISOString().split('T')[0];
    const formattedTime = brasiliaTime.toISOString().split('T')[1].substring(0, 8);
    
    // Estrutura das colunas:
    // Coluna A (0): ID
    // Coluna B (1): Ano (Data)
    // Coluna C (2): Feito? (Hora)
    // Coluna D (3): Categoria 2 (Subcategoria)
    // Coluna E (4): Categoria 1 (Categoria)
    // Coluna F (5): Frase Introdução
    // Coluna G (6): Frases
    // Coluna H (7): Frase Conclusão
    // Coluna I (8): # (Palavras-chave)
    // Coluna J (9): Música
    // Coluna K (10): Assinatura (Autor)
    const newRow = [
      nextId,             // Coluna A: ID
      formattedDate,      // Coluna B: Ano (Data)
      formattedTime,      // Coluna C: Feito? (Hora)
      subCategory || '',  // Coluna D: Categoria 2 (Subcategoria)
      category,           // Coluna E: Categoria 1 (Categoria)
      intro || '',        // Coluna F: Frase Introdução
      quote,              // Coluna G: Frases
      conclusion || '',   // Coluna H: Frase Conclusão
      description || '',  // Coluna I: Descrição e #
      music || '',        // Coluna J: Música
      author || '',       // Coluna K: Assinatura
    ];

    // Se o targetRowIndex exceder ou atingir o limite atual de linhas da grade (gridProperties.rowCount),
    // adiciona linhas na planilha automaticamente para evitar erro de limite excedido.
    if (targetRowIndex > currentGridRowCount) {
        const rowsToAdd = Math.max(100, targetRowIndex - currentGridRowCount + 50);
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            requestBody: {
                requests: [
                    {
                        appendDimension: {
                            sheetId: targetSheetId,
                            dimension: 'ROWS',
                            length: rowsToAdd,
                        },
                    },
                ],
            },
        });
    }

    const appendResponse = await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `'${resolvedSheetName}'!A${targetRowIndex}:K${targetRowIndex}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: [newRow],
        },
    });

    // Manter formatação da planilha: alinhamento centralizado, vertical no meio, Arial 12pt negrito
    try {
      let rowIndexStart = targetRowIndex - 1;
      let rowIndexEnd = targetRowIndex;

      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [
            {
              repeatCell: {
                range: {
                  sheetId: targetSheetId,
                  startRowIndex: rowIndexStart,
                  endRowIndex: rowIndexEnd,
                  startColumnIndex: 0,
                  endColumnIndex: 11, // Colunas A até K (11 colunas)
                },
                cell: {
                  userEnteredFormat: {
                    horizontalAlignment: 'CENTER',
                    verticalAlignment: 'MIDDLE',
                    textFormat: {
                      fontFamily: 'Arial',
                      fontSize: 12,
                      bold: true,
                    },
                  },
                },
                fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment,textFormat(fontFamily,fontSize,bold))',
              },
            },
            {
              repeatCell: {
                range: {
                  sheetId: targetSheetId,
                  startRowIndex: rowIndexStart,
                  endRowIndex: rowIndexEnd,
                  startColumnIndex: 5, // Coluna F (Introdução)
                  endColumnIndex: 8,   // Colunas F, G e H
                },
                cell: {
                  userEnteredFormat: {
                    horizontalAlignment: 'LEFT',
                  },
                },
                fields: 'userEnteredFormat(horizontalAlignment)',
              },
            },
          ],
        },
      });
    } catch (formatError) {
      console.warn('Aviso: Linha adicionada, mas não foi possível aplicar a formatação visual na planilha:', formatError);
    }

    const createdQuote = {
      id: nextId,
      fullId: `${resolvedSheetName}-${nextId}`,
      sheetName: resolvedSheetName,
      category,
      subCategory: subCategory || '',
      quote,
      author: author || '',
    };

    try {
      await invalidateCache();
    } catch (cacheErr) {
      console.warn('Aviso: Falha ao invalidar cache após adicionar frase:', cacheErr);
    }

    return NextResponse.json({ 
      message: 'Frase adicionada com sucesso!',
      quote: createdQuote
    });

  } catch (error) {
    console.error('Erro ao adicionar frase na planilha:', error);
    const errorMessage = error instanceof Error ? error.message : 'Um erro desconhecido ocorreu';
    return NextResponse.json({ error: 'Falha ao adicionar frase na planilha.', details: errorMessage }, { status: 500 });
  }
}
