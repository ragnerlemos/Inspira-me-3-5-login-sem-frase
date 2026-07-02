"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Clapperboard, PlusCircle } from "lucide-react";

export function ProjectEmpty() {
    return (
        <div className="text-center py-20 bg-card border rounded-lg flex flex-col items-center">
            <Clapperboard className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Nenhum projeto salvo ainda</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Vá para o editor, crie algo incrível e salve seu projeto para vê-lo aqui.
            </p>
            <Link href="/editor-de-video" passHref>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Criar Novo Projeto
                </Button>
            </Link>
        </div>
    );
}
