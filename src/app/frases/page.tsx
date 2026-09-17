

import { Suspense } from 'react';
import { getAllQuotes, buildSheetHierarchy } from '@/lib/dados';
import { FrasesClientPage } from './frases-client';
import { Skeleton } from '@/components/ui/skeleton';



// O componente de esqueleto para ser usado como fallback do Suspense.
function FrasesLoadingSkeleton() {
  return (
    <div className="grid md:grid-cols-[280px_1fr] gap-8 md:items-start px-4">
      <aside className="hidden md:block">
        <div className="sticky top-24 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </aside>
      <div>
        <div className="w-full mb-8">
            <Skeleton className="h-12 w-3/4 mx-auto" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-40 w-full" />
            ))}
        </div>
      </div>
    </div>
  );
}


// This is a Server Component that fetches the initial data.
export default async function FrasesPage() {
  
  // Fetch all quotes and categories from the latest data.
  // The client component will handle all the dynamic filtering.
  const allQuotes = await getAllQuotes(true);
  // Usa buildSheetHierarchy diretamente a partir dos quotes obtidos, evitando chamada redundante
  const sheetData = buildSheetHierarchy(allQuotes);

  // Extrai apenas as abas da planilha como as categorias principais
  const mainCategories = ['Todos'];

  for (const sheetName in sheetData) {
      if (!mainCategories.includes(sheetName)) {
          mainCategories.push(sheetName);
      }
  }

  // Ordenação personalizada: 'Todos' em primeiro, seguido pelas 4 principais específicas.
  const priorityCategories = ['trends', 'frases', 'phrases', 'dias da semana', 'datas comemorativas'];
  
  mainCategories.sort((a, b) => {
      if (a === 'Todos') return -1;
      if (b === 'Todos') return 1;

      const indexA = priorityCategories.indexOf(a.toLowerCase());
      const indexB = priorityCategories.indexOf(b.toLowerCase());

      if (indexA !== -1 && indexB !== -1) {
          return indexA - indexB;
      }
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;

      // Mantém a ordem original do restante alfabeticamente ou conforme vieram
      return a.localeCompare(b);
  });

  return (
    <Suspense fallback={<FrasesLoadingSkeleton />}>
      <FrasesClientPage
        initialQuotes={allQuotes}
        initialMainCategories={mainCategories}
        initialHierarchy={sheetData}
      />
    </Suspense>
  );
}
