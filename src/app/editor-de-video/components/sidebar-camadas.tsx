"use client";

import { useState } from "react";
import { useEditor } from "../contexts/editor-context";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, Layers, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

export function SidebarCamadas() {
    const { currentState, updateState } = useEditor();
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    
    if (!currentState) return null;

    const layers = [
        { id: 'logo', name: 'Logomarca', z: currentState.logoZIndex ?? 30 },
        { id: 'text', name: 'Texto Principal', z: currentState.textZIndex ?? 20 },
        { id: 'signature', name: 'Assinatura', z: currentState.signatureZIndex ?? 10 },
    ].sort((a, b) => b.z - a.z);

    const applyNewOrder = (reorderedLayers: typeof layers) => {
        // Assign new Z-index based on index in array (top of array = highest Z-index)
        const updates: Record<string, number> = {};
        const zStep = 10;
        
        reorderedLayers.forEach((layer, idx) => {
            const newZ = (reorderedLayers.length - idx) * zStep;
            if (layer.id === 'logo') updates.logoZIndex = newZ;
            if (layer.id === 'text') updates.textZIndex = newZ;
            if (layer.id === 'signature') updates.signatureZIndex = newZ;
        });

        updateState(updates);
    };

    const handleMove = (id: string, direction: 'up' | 'down') => {
        const index = layers.findIndex(l => l.id === id);
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === layers.length - 1) return;

        const newLayers = [...layers];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        const [movedLayer] = newLayers.splice(index, 1);
        newLayers.splice(targetIndex, 0, movedLayer);

        applyNewOrder(newLayers);
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", index.toString());
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (dragOverIndex !== index) {
            setDragOverIndex(index);
        }
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === targetIndex) {
            setDraggedIndex(null);
            setDragOverIndex(null);
            return;
        }

        const newLayers = [...layers];
        const [movedItem] = newLayers.splice(draggedIndex, 1);
        newLayers.splice(targetIndex, 0, movedItem);

        applyNewOrder(newLayers);
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    return (
        <div className="space-y-4 p-4">
            <div className="flex items-center gap-2 mb-2">
                <Layers className="w-4 h-4 text-primary" />
                <Label className="text-sm font-bold">Gerenciamento de Camadas</Label>
            </div>
            
            <p className="text-[11px] text-muted-foreground mb-4">
                Clique, segure e arraste os elementos para reordenar a prioridade ou use as setas.
            </p>

            <div className="space-y-2">
                {layers.map((layer, index) => {
                    const isDragging = draggedIndex === index;
                    const isOver = dragOverIndex === index && !isDragging;

                    return (
                        <div 
                            key={layer.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, index)}
                            onDragEnd={handleDragEnd}
                            className={cn(
                                "flex items-center justify-between p-3 rounded-lg border bg-card/80 backdrop-blur-sm transition-all cursor-grab active:cursor-grabbing select-none",
                                "hover:border-primary/50 hover:bg-accent/40",
                                isDragging && "opacity-40 border-dashed border-primary scale-[0.98]",
                                isOver && "border-2 border-primary bg-primary/10 shadow-md"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div className="text-muted-foreground/60 hover:text-foreground transition-colors cursor-grab active:cursor-grabbing">
                                    <GripVertical className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium">{layer.name}</span>
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-tighter">Z-Index: {layer.z}</span>
                                </div>
                            </div>
                            
                            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                    disabled={index === 0}
                                    onClick={() => handleMove(layer.id, 'up')}
                                    title="Mover para cima"
                                >
                                    <ChevronUp className="w-4 h-4" />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                    disabled={index === layers.length - 1}
                                    onClick={() => handleMove(layer.id, 'down')}
                                    title="Mover para baixo"
                                >
                                    <ChevronDown className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 p-3 bg-primary/5 rounded-lg border border-primary/10">
                <p className="text-[10px] leading-relaxed text-muted-foreground">
                    💡 <strong>Dica:</strong> As camadas situadas no topo da lista ficam posicionadas na frente dos elementos que estão abaixo.
                </p>
            </div>
        </div>
    );
}

