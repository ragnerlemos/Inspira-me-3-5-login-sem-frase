
import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

async function inspectSheets() {
    const spreadsheetId = process.env.SPREADSHEET_ID;
    if (!spreadsheetId) {
        console.error('SPREADSHEET_ID missing');
        return;
    }

    const res = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetName = res.data.sheets?.[0]?.properties?.title;
    if (!sheetName) return;

    const values = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `'${sheetName}'!A1:L5`,
    });

    console.log(`Headers for sheet "${sheetName}":`, values.data.values?.[0]);
    console.log(`First data row:`, values.data.values?.[1]);
}

inspectSheets().catch(console.error);
