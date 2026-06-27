import { NextResponse } from 'next/server';
import { invalidateCache } from '@/lib/dados';

export async function POST() {
  try {
    await invalidateCache();
    return NextResponse.json({ message: 'Cache invalidado com sucesso.' });
  } catch (error) {
    console.error('Erro ao invalidar cache:', error);
    return NextResponse.json({ error: 'Falha ao invalidar cache.' }, { status: 500 });
  }
}
