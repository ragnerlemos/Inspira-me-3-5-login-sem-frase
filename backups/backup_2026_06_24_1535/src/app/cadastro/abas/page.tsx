
import { getAllSheetNames } from '@/lib/dados';
import { AbasClientPage } from './abas-client';

// Componente de Servidor que busca os nomes das abas da planilha.
export default async function AbasPage() {
  const sheetNames = await getAllSheetNames(true); // Força a busca de dados novos

  return (
    <AbasClientPage initialSheetNames={sheetNames} />
  );
}
