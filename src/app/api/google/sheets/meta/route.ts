import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  const { searchParams } = new URL(req.url);
  const spreadsheetId = searchParams.get('spreadsheetId');

  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!spreadsheetId) {
    return NextResponse.json({ error: 'spreadsheetId is required' }, { status: 400 });
  }

  try {
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties.title`, {
      headers: {
        Authorization: authHeader,
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error('Sheets API error:', errorData);
      return NextResponse.json({ error: 'Failed to fetch spreadsheet metadata' }, { status: res.status });
    }

    const data = await res.json();
    const sheetNames = data.sheets?.map((s: any) => s.properties.title) || [];
    return NextResponse.json({ sheetNames });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
