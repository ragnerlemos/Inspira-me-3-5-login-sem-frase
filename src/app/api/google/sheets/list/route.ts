import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // List spreadsheets from Drive API
    // q: mimeType = 'application/vnd.google-apps.spreadsheet'
    const query = encodeURIComponent("mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false");
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime)`, {
      headers: {
        Authorization: authHeader,
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error('Drive API error:', errorData);
      return NextResponse.json({ error: 'Failed to fetch spreadsheets from Google Drive' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data.files);
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
