"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { LucideIcon } from "lucide-react";

export interface AspectRatioOption {
    label: string;
    value: string;
    icon: LucideIcon;
}

export interface SidebarCanvasProps {
    aspectRatios: AspectRatioOption[];
    aspectRatio: string;
    setAspectRatio: (ratio: string) => void;
    scale: number;
    setScale: (scale: number) => void;
}

export function SidebarCanvas({ aspectRatios, aspectRatio, setAspectRatio, scale, setScale }: SidebarCanvasProps) {
    return (
        <div className="space-y-4 p-4">
            <div className="space-y-2">
                <Label>Proporção da Tela</Label>
                <div className="grid grid-cols-3 gap-2">
                    {aspectRatios.map((ratio) => (
                        <Button
                            key={ratio.value}
                            onClick={() => setAspectRatio(ratio.value)}
                            variant={aspectRatio === ratio.value ? "secondary" : "outline"}
                            className="flex flex-col h-20 gap-1"
                        >
                            <ratio.icon className="h-6 w-6" />
                            <span className="text-xs">{ratio.label}</span>
                        </Button>
                    ))}
                </div>
            </div>
            <Separator />
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <Label>Escala do Canvas</Label>
                    <span className="text-sm font-mono">{Math.round(scale * 100)}%</span>
                </div>
                <Slider value={[scale]} onValueChange={(v) => setScale(v[0])} min={0.5} max={2} step={0.01} />
                <div className="flex justify-between gap-1">
                    {[80, 85, 90, 95, 100].map((val) => (
                        <Button key={val} variant="outline" size="sm" className="h-7 flex-1 text-xs px-0" onClick={() => setScale(val / 100)}>
                            {val}%
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    );
}
