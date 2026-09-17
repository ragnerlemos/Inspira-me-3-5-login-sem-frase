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

sheets.spreadsheets.get({ spreadsheetId }).then(meta => {
  console.log(meta.data.sheets.map(s => s.properties.title));
}).catch(console.error);
