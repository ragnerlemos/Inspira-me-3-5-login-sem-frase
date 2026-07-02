"use client";

import { Search, FileSpreadsheet } from 'lucide-react';

interface QuotesEmptyStateProps {
    type: 'no-results' | 'no-data';
}

export function QuotesEmptyState({ type }: QuotesEmptyStateProps) {
    if (type === 'no-data') {
        return (
            <div className="text-center py-20 bg-card border rounded-lg flex flex-col items-center">
                <FileSpreadsheet className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Não há dados cadastrados</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                    A planilha do Google está vazia ou não contém frases válidas.
                </p>
            </div>
        );
    }

    return (
        <div className="text-center py-20 bg-card border rounded-lg flex flex-col items-center">
            <Search className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Nenhuma frase encontrada</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
                Tente ajustar sua busca ou selecionar outra categoria.
            </p>
        </div>
    );
}
