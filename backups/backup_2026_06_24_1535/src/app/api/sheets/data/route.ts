
import { getSheetData, getAllSheetNames } from '@/lib/dados';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [sheetData, sheetNames] = await Promise.all([
      getSheetData(true),
      getAllSheetNames(true)
    ]);
    return NextResponse.json({ sheetData, sheetNames });
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    return NextResponse.json({ error: 'Failed to fetch sheet data' }, { status: 500 });
  }
}
