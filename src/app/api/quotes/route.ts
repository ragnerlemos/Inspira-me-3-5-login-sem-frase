import { getAllQuotes } from '@/lib/dados';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const quotes = await getAllQuotes(true);
    return NextResponse.json(quotes);
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 });
  }
}
