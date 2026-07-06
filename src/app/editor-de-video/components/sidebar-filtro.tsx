"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useEditor } from "../contexts/editor-context";

export function SidebarFiltro({ filmColor, setFilmColor, filmOpacity, setFilmOpacity }: any) {
    const { currentState, updateState } = useEditor();
    
    if (!currentState) return null;
    
    const bg = currentState.backgroundStyle;

    const updateFilter = (key: string, value: number) => {
        updateState({
            backgroundStyle: {
                ...bg,
                [key]: value
            }
        }, true); // skipHistory for smooth sliders
    };

    const commitFilter = (key: string, value: number) => {
        updateState({
            backgroundStyle: {
                ...bg,
                [key]: value
            }
        }, false); // push to history on change end
    };

    return (
        <div className="space-y-6 p-4">
            <div className="space-y-4">
                <Label className="text-sm font-bold block mb-2">Película sobre o Fundo</Label>
                <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Cor da Película</Label>
                    <div className="relative h-10 w-full rounded-md border overflow-hidden">
                        <Input
                            type="color"
                            value={filmColor}
                            onChange={(e) => setFilmColor(e.target.value)}
                            className="absolute inset-0 w-full h-full p-0 border-none cursor-pointer opacity-0"
                        />
                        <div className="w-full h-full" style={{ backgroundColor: filmColor }} />
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <Label htmlFor="film-opacity" className="text-xs text-muted-foreground">Opacidade</Label>
                        <span className="text-xs text-muted-foreground">{filmOpacity}%</span>
                    </div>
                    <Slider 
                        id="film-opacity" 
                        min={0} 
                        max={100} 
                        step={1} 
                        value={[filmOpacity]} 
                        onValueChange={(v) => setFilmOpacity(v[0])} 
                    />
                    <div className="flex flex-wrap gap-2">
                        {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((value) => (
                            <Button
                                key={value}
                                type="button"
                                variant={filmOpacity === value ? 'secondary' : 'outline'}
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={() => setFilmOpacity(value)}
                            >
                                {value}%
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            <Separator />

            <div className="space-y-6">
                <Label className="text-sm font-bold block mb-2">Filtros de Fundo</Label>
                
                {/* Blur */}
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <Label className="text-xs text-muted-foreground">Desfoque (Blur)</Label>
                        <span className="text-xs text-muted-foreground">{bg.blur || 0}px</span>
                    </div>
                    <Slider 
                        min={0} max={20} step={1} 
                        value={[bg.blur || 0]} 
                        onValueChange={(v) => updateFilter('blur', v[0])}
                        onValueCommit={(v) => commitFilter('blur', v[0])}
                    />
                </div>

                {/* Brightness */}
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <Label className="text-xs text-muted-foreground">Brilho</Label>
                        <span className="text-xs text-muted-foreground">{bg.brightness ?? 100}%</span>
                    </div>
                    <Slider 
                        min={0} max={200} step={1} 
                        value={[bg.brightness ?? 100]} 
                        onValueChange={(v) => updateFilter('brightness', v[0])}
                        onValueCommit={(v) => commitFilter('brightness', v[0])}
                    />
                </div>

                {/* Contrast */}
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <Label className="text-xs text-muted-foreground">Contraste</Label>
                        <span className="text-xs text-muted-foreground">{bg.contrast ?? 100}%</span>
                    </div>
                    <Slider 
                        min={0} max={200} step={1} 
                        value={[bg.contrast ?? 100]} 
                        onValueChange={(v) => updateFilter('contrast', v[0])}
                        onValueCommit={(v) => commitFilter('contrast', v[0])}
                    />
                </div>

                {/* Grayscale */}
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <Label className="text-xs text-muted-foreground">Preto e Branco</Label>
                        <span className="text-xs text-muted-foreground">{bg.grayscale || 0}%</span>
                    </div>
                    <Slider 
                        min={0} max={100} step={1} 
                        value={[bg.grayscale || 0]} 
                        onValueChange={(v) => updateFilter('grayscale', v[0])}
                        onValueCommit={(v) => commitFilter('grayscale', v[0])}
                    />
                </div>

                {/* Sepia */}
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <Label className="text-xs text-muted-foreground">Sépia</Label>
                        <span className="text-xs text-muted-foreground">{bg.sepia || 0}%</span>
                    </div>
                    <Slider 
                        min={0} max={100} step={1} 
                        value={[bg.sepia || 0]} 
                        onValueChange={(v) => updateFilter('sepia', v[0])}
                        onValueCommit={(v) => commitFilter('sepia', v[0])}
                    />
                </div>
            </div>
        </div>
    );
}
