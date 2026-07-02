"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FavoritosEmpty() {
    return (
        <div className="text-center py-20 bg-card border rounded-lg flex flex-col items-center">
            <Star className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Nenhuma frase favorita ainda</h2>
            <p className="text-muted-foreground mb-6">
                Clique no ícone de estrela (⭐) em uma frase para adicioná-la aqui.
            </p>
            <Link href="/frases" passHref>
                <Button>Encontrar Inspiração</Button>
            </Link>
        </div>
    );
}
