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

async function checkAllHeaders() {
  const sheetNames = [ 'Trends', 'Frases', 'Dias da Semana', 'Datas Comemorativas' ];
  for (const name of sheetNames) {
    try {
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `'${name}'!A1:Z1`
      });
      console.log(`${name} headers:`, res.data.values?.[0]);
    } catch (e) {
      console.error(`Error reading ${name}:`, e.message);
    }
  }
}

checkAllHeaders();
