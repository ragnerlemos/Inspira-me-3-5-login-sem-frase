"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Check, RotateCcw } from "lucide-react";

interface BrandColorsCardProps {
    initialColors?: string[];
    onSave: (colors: string[]) => void;
}

export function BrandColorsCard({ initialColors = ["#3b82f6", "#1e293b", "#ffffff"], onSave }: BrandColorsCardProps) {
    const [colors, setColors] = useState<string[]>(initialColors);

    const handleColorChange = (index: number, value: string) => {
        const newColors = [...colors];
        newColors[index] = value;
        setColors(newColors);
    };

    const handleReset = () => {
        setColors(["#3b82f6", "#1e293b", "#ffffff"]);
    };

    return (
        <Card className="border-slate-800 bg-[#020817]/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-xl font-bold">Paleta de Cores</CardTitle>
                <CardDescription>
                    Defina as cores principais da sua marca para usar nos modelos.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                    {colors.map((color, index) => (
                        <div key={index} className="space-y-2 text-center">
                            <Label className="text-xs uppercase text-muted-foreground">
                                {index === 0 ? "Principal" : index === 1 ? "Secundária" : "Acento"}
                            </Label>
                            <div className="relative group">
                                <input
                                    type="color"
                                    value={color}
                                    onChange={(e) => handleColorChange(index, e.target.value)}
                                    className="w-full h-12 rounded-lg cursor-pointer border-2 border-slate-700 bg-transparent overflow-hidden"
                                />
                            </div>
                            <span className="text-[10px] font-mono text-muted-foreground uppercase">{color}</span>
                        </div>
                    ))}
                </div>

                <div className="flex gap-2 pt-2">
                    <Button 
                        className="flex-1 bg-primary hover:bg-primary/90"
                        onClick={() => onSave(colors)}
                    >
                        <Check className="w-4 h-4 mr-2" />
                        Salvar Cores
                    </Button>
                    <Button 
                        variant="outline" 
                        size="icon"
                        className="border-slate-700 hover:bg-slate-800"
                        onClick={handleReset}
                        title="Resetar para o padrão"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
