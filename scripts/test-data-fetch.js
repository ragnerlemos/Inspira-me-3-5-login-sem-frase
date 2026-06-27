require('dotenv').config({ path: '.env.local' });
const { google } = require('googleapis');

async function main() {
  const spreadsheetId = process.env.SPREADSHEET_ID;
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!spreadsheetId || !clientEmail || !privateKey) {
    throw new Error('Configurações ausentes em .env.local');
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

  const sheetNamesRes = await sheets.spreadsheets.get({ spreadsheetId });
  const sheetNames = sheetNamesRes.data.sheets
    ?.map(sheet => sheet.properties?.title)
    .filter(Boolean);

  console.log('Nomes das Abas:', sheetNames);

  // Vamos ler as primeiras 5 linhas de cada aba relevantes para ver o formato
  for (const name of sheetNames) {
    if (name.startsWith('NV') || name.startsWith('#')) {
      console.log(`\nIgnorando aba técnica: "${name}"`);
      continue;
    }
    console.log(`\n--- Lendo aba de conteúdo: "${name}" ---`);
    try {
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `'${name}'!A1:L5`,
      });

      const rows = res.data.values;
      if (!rows || rows.length === 0) {
        console.log('Aba vazia ou sem linhas.');
        continue;
      }

      console.log(`Lidas ${rows.length} linhas.`);
      console.log('Cabeçalho (Linha 1):', rows[0]);
      for (let idx = 1; idx < Math.min(rows.length, 4); idx++) {
        console.log(`Linha ${idx + 1}:`, rows[idx]);
      }
    } catch (e) {
      console.error(`Erro ao ler aba "${name}":`, e.message);
    }
  }
}

main().catch(console.error);
