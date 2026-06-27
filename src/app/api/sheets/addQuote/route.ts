
import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const TEMPLATE_SHEET_NAME = 'Modelo';

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

async function ensureSheetExists(sheetName: string) {
    if (!SPREADSHEET_ID) throw new Error('O ID da planilha (SPREADSHEET_ID) não está configurado.');

    const spreadsheetMeta = await sheets.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID
    });

    const existingSheet = spreadsheetMeta.data.sheets?.find(s => s.properties?.title === sheetName);

    if (!existingSheet) {
        const templateSheet = spreadsheetMeta.data.sheets?.find(s => s.properties?.title === TEMPLATE_SHEET_NAME);
        if (!templateSheet || templateSheet.properties?.sheetId == null) {
            throw new Error(`A aba modelo "${TEMPLATE_SHEET_NAME}" não foi encontrada para criar a nova aba "${sheetName}".`);
        }
        await sheets.spreadsheets.batchUpdate({
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
    }
}


export async function POST(req: NextRequest) {
  try {
    const { quote, author, category, subCategory, sheetName } = await req.json();

    if (!quote || !category || !sheetName) {
      return NextResponse.json({ error: 'Frase, categoria e nome da aba são obrigatórios.' }, { status: 400 });
    }

    if (!SPREADSHEET_ID) {
        return NextResponse.json({ error: 'O ID da planilha (SPREADSHEET_ID) não está configurado.' }, { status: 500 });
    }

    // Garante que a aba existe antes de tentar adicionar a linha.
    await ensureSheetExists(sheetName);
    
    // Obter data/hora atual e ajustar para o fuso de Brasília (UTC-3)
    const now = new Date();
    const brasiliaTime = new Date(now.valueOf() - 3 * 60 * 60 * 1000);

    // Formato YYYY-MM-DD
    const formattedDate = brasiliaTime.toISOString().split('T')[0];
    const formattedTime = brasiliaTime.toISOString().split('T')[1].substring(0, 8);
    
    // A ordem das colunas deve corresponder à sua planilha
    const newRow = [
      formattedDate,      // Coluna A: Data
      formattedTime,      // Coluna B: Hora
      subCategory || '',  // Coluna C: Subcategoria
      category,           // Coluna D: Categoria
      '',                 // Coluna E: Status (em branco)
      quote,              // Coluna F: Frase
      '',                 // Coluna G: Palavras-chave
      '',                 // Coluna H: URL da Imagem
      '',                 // Coluna I: Link
      author || '',       // Coluna J: Autor
    ];

    await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetName}!A:J`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: [newRow],
        },
    });

    return NextResponse.json({ message: 'Frase adicionada com sucesso!' });

  } catch (error) {
    console.error('Erro ao adicionar frase na planilha:', error);
    const errorMessage = error instanceof Error ? error.message : 'Um erro desconhecido ocorreu';
    return NextResponse.json({ error: 'Falha ao adicionar frase na planilha.', details: errorMessage }, { status: 500 });
  }
}
