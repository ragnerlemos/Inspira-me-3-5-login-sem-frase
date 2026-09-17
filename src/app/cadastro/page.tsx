
import { getSheetData, getAllSheetNames } from '@/lib/dados';
import { CadastroClientPage } from './cadastro-client';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

export default async function CadastroPage() {
  let sheetData = {};
  let allSheetNames: string[] = [];

  try {
    const [data, names] = await Promise.all([
      getSheetData(false),
      getAllSheetNames(false),
    ]);
    sheetData = data || {};
    allSheetNames = names || [];
  } catch (err) {
    console.error('Erro ao carregar dados da planilha para cadastro:', err);
  }

  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-muted-foreground">Carregando formulário de cadastro...</div>}>
      <CadastroClientPage 
        initialSheetData={sheetData} 
        initialSheetNames={allSheetNames}
      />
    </Suspense>
  );
}
