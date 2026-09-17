import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { auth as firebaseAuth } from '@/firebase/admin';
import { invalidateCache } from '@/lib/dados';

const ADMIN_EMAIL = 'efeitosbd@gmail.com';

export async function POST(req: NextRequest) {
  try {
    const { 
        quoteId, 
        sheetName, 
        rowNumber,
        quote,
        intro,
        conclusion,
        description,
        music,
        author,
        category,
        subCategory
    } = await req.json();
    
    // Auth check: if token provided, verify admin; if not provided in web session, proceed
    const authHeader = req.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split('Bearer ')[1];
      try {
        const decodedToken = await firebaseAuth.verifyIdToken(token);
        if (decodedToken.email && decodedToken.email !== ADMIN_EMAIL) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
      } catch (authErr) {
        console.warn('Firebase token verification warning in update-quote:', authErr);
      }
    }

    // Google Sheets Setup
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.SPREADSHEET_ID;
    
    if (!quoteId || !sheetName) {
      return NextResponse.json({ error: 'ID da frase ou nome da aba ausente' }, { status: 400 });
    }

    // Get the sheet
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const sheet = spreadsheet.data.sheets?.find(s => {
      const title = s.properties?.title;
      return title && sheetName && title.toLowerCase().trim() === sheetName.toLowerCase().trim();
    });
    
    if (!sheet) {
      return NextResponse.json({ error: `Aba "${sheetName}" não encontrada.` }, { status: 404 });
    }

    const actualSheetName = sheet.properties!.title!;

    // Search for the ID in the sheet
    const valuesRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `'${actualSheetName}'!A:A`,
    });

    const rows = valuesRes.data.values || [];
    let foundRowIndex = -1;

    for (let i = 0; i < rows.length; i++) {
        const colA = rows[i][0]?.toString().trim();
        const expectedId = `${actualSheetName}-${i}`;
        const targetId = quoteId.toString().trim();

        if (
            (colA && colA === targetId) ||
            expectedId === targetId ||
            (colA && `${actualSheetName}-${i}-${colA}` === targetId) ||
            (rowNumber !== undefined && Number(rowNumber) === i)
        ) {
            foundRowIndex = i;
            break;
        }
    }

    if (foundRowIndex === -1) {
      return NextResponse.json({ error: 'Frase não encontrada na planilha para edição.' }, { status: 404 });
    }

    // Prepare updated row data
    // We only update columns from D (index 3) onwards to preserve original ID, Date and Time if possible,
    // OR we update from A if we want to preserve the ID but update the rest.
    // Let's preserve A, B, C and update D to K.
    
    const targetRowNumber = foundRowIndex + 1;
    const range = `'${actualSheetName}'!D${targetRowNumber}:K${targetRowNumber}`;
    
    const updatedValues = [
        subCategory || '',  // Coluna D: Categoria 2 (Subcategoria)
        category,           // Coluna E: Categoria 1 (Categoria)
        intro || '',        // Coluna F: Frase Introdução
        quote,              // Coluna G: Frases
        conclusion || '',   // Coluna H: Frase Conclusão
        description || '',  // Coluna I: Descrição e #
        music || '',        // Coluna J: Música
        author || '',       // Coluna K: Assinatura
    ];

    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: [updatedValues],
        },
    });

    // Clear cache
    await invalidateCache();

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Error updating quote in sheet:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
