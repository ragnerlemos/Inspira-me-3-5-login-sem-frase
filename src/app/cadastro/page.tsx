
import { getSheetData, getAllSheetNames } from '@/lib/dados';
import { CadastroClientPage } from './cadastro-client';

export const dynamic = 'force-dynamic';

// Agora é um Componente de Servidor que busca os dados antes de renderizar.
export default async function CadastroPage() {
  const sheetData = await getSheetData(true); // Para as categorias
  const allSheetNames = await getAllSheetNames(true); // Para a lista completa de abas

  return (
    <CadastroClientPage 
      initialSheetData={sheetData} 
      initialSheetNames={allSheetNames}
    />
  );
}
