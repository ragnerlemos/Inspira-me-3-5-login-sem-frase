import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  const { searchParams } = new URL(req.url);
  const spreadsheetId = searchParams.get('spreadsheetId');
  const range = searchParams.get('range');

  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!spreadsheetId || !range) {
    return NextResponse.json({ error: 'spreadsheetId and range are required' }, { status: 400 });
  }

  try {
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`, {
      headers: {
        Authorization: authHeader,
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error('Sheets API error:', errorData);
      return NextResponse.json({ error: 'Failed to fetch spreadsheet values' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data.values || []);
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
