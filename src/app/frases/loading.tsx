import { Skeleton } from '@/components/ui/skeleton';

// O componente de esqueleto para ser exibido enquanto a página carrega no servidor
export default function Loading() {
  return (
    <div className="grid md:grid-cols-[280px_1fr] gap-8 md:items-start px-4 mt-8">
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
                <div key={i} className="flex flex-col gap-2">
                    <Skeleton className="h-40 w-full" />
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}
