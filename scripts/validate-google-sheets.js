require('dotenv').config({ path: '.env.local' });
const { google } = require('googleapis');

async function main() {
  const spreadsheetId = process.env.SPREADSHEET_ID;
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!spreadsheetId) {
    throw new Error('SPREADSHEET_ID não está definido em .env.local');
  }
  if (!clientEmail) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_EMAIL não está definido em .env.local');
  }
  if (!privateKey) {
    throw new Error('GOOGLE_PRIVATE_KEY não está definido em .env.local');
  }

  privateKey = privateKey.replace(/\\n/g, '\n');

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  const response = await sheets.spreadsheets.get({ spreadsheetId });
  const title = response.data.properties?.title || 'não disponível';
  const sheetNames = response.data.sheets
    ?.map(sheet => sheet.properties?.title)
    .filter(Boolean)
    .join(', ');

  console.log('Planilha encontrada com sucesso!');
  console.log(`Título: ${title}`);
  console.log(`Abas: ${sheetNames}`);
}

main().catch(error => {
  console.error('Falha na validação do Google Sheets:');
  console.error(error.message || error);
  process.exit(1);
});
