"use client";

import { useEditor } from "../contexts/editor-context";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

export function SidebarCamadas() {
    const { currentState, updateState } = useEditor();
    
    if (!currentState) return null;

    const layers = [
        { id: 'logo', name: 'Logomarca', z: currentState.logoZIndex ?? 30 },
        { id: 'text', name: 'Texto Principal', z: currentState.textZIndex ?? 20 },
        { id: 'signature', name: 'Assinatura', z: currentState.signatureZIndex ?? 10 },
    ].sort((a, b) => b.z - a.z);

    const handleMove = (id: string, direction: 'up' | 'down') => {
        const index = layers.findIndex(l => l.id === id);
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === layers.length - 1) return;

        const otherIndex = direction === 'up' ? index - 1 : index + 1;
        const currentLayer = layers[index];
        const otherLayer = layers[otherIndex];

        // Swap Z-indexes
        const newZ = otherLayer.z;
        const otherNewZ = currentLayer.z;

        const updates: any = {};
        if (currentLayer.id === 'logo') updates.logoZIndex = newZ;
        if (currentLayer.id === 'text') updates.textZIndex = newZ;
        if (currentLayer.id === 'signature') updates.signatureZIndex = newZ;

        if (otherLayer.id === 'logo') updates.logoZIndex = otherNewZ;
        if (otherLayer.id === 'text') updates.textZIndex = otherNewZ;
        if (otherLayer.id === 'signature') updates.signatureZIndex = otherNewZ;

        updateState(updates);
    };

    return (
        <div className="space-y-4 p-4">
            <div className="flex items-center gap-2 mb-4">
                <Layers className="w-4 h-4 text-primary" />
                <Label className="text-sm font-bold">Gerenciamento de Camadas</Label>
            </div>
            
            <p className="text-[10px] text-muted-foreground mb-4">
                Organize a ordem de sobreposição dos elementos na tela.
            </p>

            <div className="space-y-2">
                {layers.map((layer, index) => (
                    <div 
                        key={layer.id}
                        className={cn(
                            "flex items-center justify-between p-3 rounded-lg border bg-card/50 backdrop-blur-sm transition-colors",
                            "hover:border-primary/50"
                        )}
                    >
                        <div className="flex flex-col">
                            <span className="text-sm font-medium">{layer.name}</span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-tighter">Z-Index: {layer.z}</span>
                        </div>
                        
                        <div className="flex gap-1">
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                disabled={index === 0}
                                onClick={() => handleMove(layer.id, 'up')}
                            >
                                <ChevronUp className="w-4 h-4" />
                            </Button>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                disabled={index === layers.length - 1}
                                onClick={() => handleMove(layer.id, 'down')}
                            >
                                <ChevronDown className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/10">
                <p className="text-[10px] leading-relaxed text-muted-foreground">
                    Dica: Elementos no topo da lista aparecem na frente dos elementos abaixo deles.
                </p>
            </div>
        </div>
    );
}
