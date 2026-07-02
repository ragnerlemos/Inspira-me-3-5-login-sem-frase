"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle, Library } from "lucide-react";

interface GalleryEmptyProps {
    onAddClick: () => void;
    disabled?: boolean;
}

export function GalleryEmpty({ onAddClick, disabled }: GalleryEmptyProps) {
    return (
        <div className="text-center py-20 bg-card border rounded-lg flex flex-col items-center">
            <Library className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Nenhuma mídia nesta categoria</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Adicione imagens, vídeos ou áudios para começar a organizar sua galeria.
            </p>
            <Button 
                variant="outline" 
                disabled={disabled}
                onClick={onAddClick}
            >
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Mídia
            </Button>
        </div>
    );
}
