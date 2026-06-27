
import { Suspense } from 'react';
import ModelosClientPage from './modelos-client';
import { Card, CardContent } from '@/components/ui/card';

// O componente de esqueleto para ser usado como fallback do Suspense.
function TemplateSkeleton() {
    return (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
                 <Card key={i} className="animate-pulse">
                    <div className="aspect-square bg-muted rounded-t-lg"></div>
                    <CardContent className="p-2 space-y-1">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

// A página de modelos agora é um Componente de Servidor.
export default function ModelosPage() {
  return (
    <Suspense fallback={
        <main className="overflow-y-auto">
            <div className="container mx-auto py-8 px-4">
                <div className="text-center mb-8">
                    <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">Modelos</h1>
                    <p className="text-muted-foreground mt-2 text-lg">Carregando seus modelos...</p>
                </div>
                <TemplateSkeleton />
            </div>
        </main>
    }>
      <ModelosClientPage />
    </Suspense>
  );
}
