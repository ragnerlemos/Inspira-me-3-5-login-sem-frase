"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FlipHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { EstiloFundo } from "../tipos";

export interface SidebarCoresProps {
    backgroundStyle: EstiloFundo;
    setBackgroundStyle: (style: EstiloFundo) => void;
    fgColor: string;
    setFgColor: (color: string) => void;
    predefinedColors: string[];
    onInvertColors: () => void;
}

export function SidebarCores({ backgroundStyle, setBackgroundStyle, fgColor, setFgColor, predefinedColors, onInvertColors }: SidebarCoresProps) {
    const bgColor = backgroundStyle.type === 'solid' ? backgroundStyle.value : '#000000';

    const handleResetColors = () => {
        setBackgroundStyle({ type: 'solid', value: '#FFFFFF' });
        setFgColor('#000000');
    };

    const handleSwapColors = () => {
        const currentBg = backgroundStyle.type === 'solid' ? backgroundStyle.value : '#000000';
        setBackgroundStyle({ type: 'solid', value: fgColor });
        setFgColor(currentBg);
    };

    return (
        <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-left block">Cor do Fundo</Label>
                    <div className="relative h-10 w-full rounded-md border overflow-hidden">
                        <Input
                            type="color"
                            value={bgColor}
                            onChange={(e) => setBackgroundStyle({ type: 'solid', value: e.target.value })}
                            className="absolute inset-0 w-full h-full p-0 border-none cursor-pointer opacity-0"
                        />
                        <div className="w-full h-full" style={{ backgroundColor: bgColor }} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label className="text-left block">Cor do Texto</Label>
                    <div className="relative h-10 w-full rounded-md border overflow-hidden">
                        <Input
                            type="color"
                            value={fgColor}
                            onChange={e => setFgColor(e.target.value)}
                            className="absolute inset-0 w-full h-full p-0 border-none cursor-pointer opacity-0"
                        />
                        <div className="w-full h-full" style={{ backgroundColor: fgColor }} />
                    </div>
                </div>
            </div>

            <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 flex items-center justify-center gap-2" onClick={handleResetColors}>
                    Resetar
                </Button>
                <Button variant="outline" size="sm" className="flex-1 flex items-center justify-center gap-2" onClick={handleSwapColors}>
                    Alternar
                </Button>
            </div>

            <div className="space-y-2">
                <Label className="text-xs text-muted-foreground block text-left">Cores de Fundo Predefinidas</Label>
                <div className="grid grid-cols-6 gap-2">
                    {predefinedColors.map((color) => (
                        <button
                            key={color}
                            type="button"
                            onClick={() => setBackgroundStyle({ type: 'solid', value: color })}
                            style={{ backgroundColor: color }}
                            className={cn(
                                "h-7 w-7 rounded-md border border-muted transition-all hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                                bgColor.toLowerCase() === color.toLowerCase() && "ring-2 ring-primary scale-105 border-primary"
                            )}
                            title={color}
                        />
                    ))}
                </div>
            </div>

            <Button variant="outline" className="w-full flex items-center gap-2" onClick={onInvertColors} title="Inverter Cor do Texto">
                <FlipHorizontal className="h-4 w-4" />
                Inverter Cor do Texto
            </Button>
        </div>
    );
}
