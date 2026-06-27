import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

async function diagnostic() {
    const spreadsheetId = process.env.SPREADSHEET_ID;
    if (!spreadsheetId) {
        console.error('SPREADSHEET_ID missing');
        return;
    }

    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetNames = spreadsheet.data.sheets?.map(s => s.properties?.title).filter(Boolean) || [];

    let totalQuotes = 0;
    let emptyIds = 0;
    let validIds = 0;

    for (const name of sheetNames) {
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `'${name}'!A:F`,
        });

        const rows = res.data.values || [];
        // Skip header
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            const id = row[0];
            const text = row[5]; // Assuming index 5 is text based on previous investigation
            
            if (!text) continue; // Not a quote row
            
            totalQuotes++;
            if (!id || id.toString().trim() === '') {
                emptyIds++;
            } else {
                validIds++;
            }
        }
    }

    console.log(`--- DIAGNOSTIC RESULT ---`);
    console.log(`Total quotes found: ${totalQuotes}`);
    console.log(`Quotes with valid ID: ${validIds}`);
    console.log(`Quotes with EMPTY/MISSING ID: ${emptyIds}`);
}

diagnostic().catch(console.error);
