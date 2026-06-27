import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { auth as firebaseAuth } from '@/firebase/admin';
import { invalidateCache } from '@/lib/dados';

const ADMIN_EMAIL = 'efeitosbd@gmail.com';

export async function POST(req: NextRequest) {
  try {
    const { quoteId, sheetName, rowNumber } = await req.json();
    
    // Auth check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await firebaseAuth.verifyIdToken(token);
    
    if (decodedToken.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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
    
    console.log(`[DELETE QUOTE] Request received. SpreadsheetID: ${spreadsheetId}, SheetName: "${sheetName}", QuoteID: ${quoteId}`);

    if (!quoteId || !sheetName) {
      return NextResponse.json({ error: 'ID da frase ou nome da aba ausente' }, { status: 400 });
    }

    // Get the sheet index and ID
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const sheet = spreadsheet.data.sheets?.find(s => {
      const title = s.properties?.title;
      return title && sheetName && title.toLowerCase().trim() === sheetName.toLowerCase().trim();
    });
    
    if (!sheet || sheet.properties?.sheetId === undefined) {
      console.error(`[DELETE QUOTE] Sheet "${sheetName}" not found.`);
      return NextResponse.json({ error: `Aba "${sheetName}" não encontrada.` }, { status: 404 });
    }

    const sheetId = sheet.properties.sheetId;
    const actualSheetName = sheet.properties.title!;

    // Search for the ID in the sheet
    const valuesRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `'${actualSheetName}'!A:A`,
    });

    const rows = valuesRes.data.values || [];
    let foundRowIndex = -1;

    for (let i = 0; i < rows.length; i++) {
        if (rows[i][0]?.toString() === quoteId.toString()) {
            foundRowIndex = i;
            break;
        }
    }

    if (foundRowIndex === -1) {
      console.error(`[DELETE QUOTE] Quote ID "${quoteId}" not found in sheet "${actualSheetName}".`);
      return NextResponse.json({ error: 'Frase não encontrada na planilha.' }, { status: 404 });
    }

    console.log(`[DELETE QUOTE] Resolved sheetId: ${sheetId}, RowIndex to delete: ${foundRowIndex}`);

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId,
                dimension: 'ROWS',
                startIndex: foundRowIndex,
                endIndex: foundRowIndex + 1,
              }
            }
          }
        ]
      }
    });

    console.log('[DELETE QUOTE] BatchUpdate completed successfully. Invalidating system-wide caching.');

    // Clear memory/process cache synchronously upon deletion to guarantee fresh subsequent fetch
    await invalidateCache();

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Error deleting quote from sheet:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
