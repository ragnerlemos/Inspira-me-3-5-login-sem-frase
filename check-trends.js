const { google } = require('googleapis');
const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.replace(/^["']|["']$/g, '');
const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n');
const spreadsheetId = process.env.SPREADSHEET_ID?.replace(/^["']|["']$/g, '');

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: clientEmail,
    private_key: privateKey,
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({
  version: 'v4',
  auth: auth,
});

sheets.spreadsheets.values.get({
  spreadsheetId,
  range: "'Trends'!A1:Z5"
}).then(res => {
  console.log("Trends sheet headers/rows:", res.data.values);
}).catch(console.error);
