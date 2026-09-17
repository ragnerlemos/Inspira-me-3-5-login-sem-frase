"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import Link from 'next/link';
import { Upload, Image as ImageIcon, Palette, Layers, Pipette, FlipHorizontal, RotateCcw, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { toggleTextColor } from "../utils/color-utils";
import type { EstiloFundo, EditorState, VignetteState } from "../tipos";
import { Switch } from "@/components/ui/switch";
import { useEditor } from "../contexts/editor-context";

const PREDEFINED_COLORS = [
  "#FFFFFF", // Branco
  "#F5F5FA", // Off-white
  "#E5E5EA", // Cinza Claro
  "#8E8E93", // Cinza Médio
  "#3A3A3C", // Cinza Escuro
  "#000000", // Preto
  "#FDE1E4", // Rosa Pastel
  "#E2F0CB", // Verde Pastel
  "#C4DEF6", // Azul Pastel
  "#FFECA1", // Amarelo Pastel
  "#DBCDF0", // Lilás Pastel
  "#F5E8C7"  // Bege Pastel
];

type TipoFundoAtivo = 'media' | 'solid' | 'gradient' | 'vignette';

export function ControleTipoFundo({ 
    backgroundStyle, 
    setBackgroundStyle, 
    fgColor, 
    setFgColor,
    vignette,
    setVignette,
    updateState
}: { 
    backgroundStyle: EstiloFundo; 
    setBackgroundStyle?: (style: EstiloFundo) => void; 
    fgColor?: string; 
    setFgColor?: (color: string) => void;
    vignette?: VignetteState;
    setVignette?: (val: VignetteState) => void;
    updateState?: (newState: Partial<EditorState>) => void;
}) {
    const { currentState, updateState: updateEditorState } = useEditor();
    const actualVignette = vignette || currentState.vignette || {
        enabled: true,
        type: "bottom",
        color: "#000000",
        opacity: 0.4,
        intensity: 0.6,
        feather: 0.8
    };

    const handleVignetteChange = (changes: Partial<VignetteState>) => {
        const newVignette = { ...actualVignette, ...changes };
        if (setVignette) setVignette(newVignette);
        else if (updateState) updateState({ vignette: newVignette });
        else updateEditorState({ vignette: newVignette });
    };

    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    
    const [activeTab, setActiveTab] = useState<TipoFundoAtivo>(backgroundStyle.type as TipoFundoAtivo);

    useEffect(() => {
        if (backgroundStyle.type !== activeTab && activeTab !== 'vignette') {
             setActiveTab(backgroundStyle.type as TipoFundoAtivo);
        }
    }, [backgroundStyle.type, activeTab]);

    const { gradient } = useMemo(() => {
        const type = backgroundStyle.type;
        let grad = { type: 'linear' as 'linear'|'radial', colors: ['#A06CD5', '#45B8AC'] as [string, string], direction: 'to right' };
        if (type === 'gradient' && backgroundStyle.value) {
            try {
                const gradType = backgroundStyle.value.startsWith('linear') ? 'linear' : 'radial';
                const parts = backgroundStyle.value.match(/\((.*)\)/)?.[1].split(', ');
                if (!parts) throw new Error("Invalid gradient string");
                
                let direction = 'to right';
                let colors: [string, string] = ['#A06CD5', '#45B8AC'];
                
                if (gradType === 'linear') {
                    if (parts[0].startsWith('to ')) {
                        direction = parts[0];
                        colors = [parts[1], parts[2]] as [string, string];
                    } else {
                        colors = [parts[0], parts[1]] as [string, string];
                    }
                } else {
                     const colorParts = backgroundStyle.value.match(/#(?:[0-9a-fA-F]{3}){1,2}|rgb\([^)]+\)/g);
                     if (colorParts && colorParts.length >= 2) {
                        colors = [colorParts[0], colorParts[1]] as [string, string];
                    }
                }
                grad = { type: gradType, colors, direction };

            } catch {}
        }
        return { gradient: grad };
    }, [backgroundStyle]);

    const handleTabChange = (tab: TipoFundoAtivo) => {
        setActiveTab(tab);
        if (tab === 'solid') {
            if (setBackgroundStyle) setBackgroundStyle({ type: 'solid', value: '#333333' });
        } else if (tab === 'gradient') {
            const gradValue = `${gradient.type}-gradient(${gradient.type === 'linear' ? `${gradient.direction}, ` : `circle at center, `}${gradient.colors[0]}, ${gradient.colors[1]})`;
            if (setBackgroundStyle) setBackgroundStyle({ type: 'gradient', value: gradValue });
        } else if (tab === 'media') {
             if (setBackgroundStyle) setBackgroundStyle({ type: 'media', value: '' });
        }
    };
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const fileName = file.name.toLowerCase();
        const isImage = file.type.startsWith('image/') || ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].some(ext => fileName.endsWith(ext));
        const isVideo = file.type.startsWith('video/') || ['.mp4', '.webm', '.ogg'].some(ext => fileName.endsWith(ext));

        if (!isImage && !isVideo) {
            toast({ variant: "destructive", title: "Arquivo Inválido", description: "Por favor, selecione um arquivo de imagem ou vídeo." });
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            setBackgroundStyle({ type: 'media', value: e.target?.result as string });
        };
        reader.readAsDataURL(file);
    };

    const handleSolidColorChange = (color: string) => {
        setBackgroundStyle({ type: 'solid', value: color });
    };
    
    const handleGradientChange = (grad: { type: 'linear' | 'radial', colors: [string, string], direction: string }) => {
        const gradValue = `${grad.type}-gradient(${grad.type === 'linear' ? `${grad.direction}, ` : `circle at center, `}${grad.colors[0]}, ${grad.colors[1]})`;
        setBackgroundStyle({ type: 'gradient', value: gradValue });
    };

    const handleGradientColorChange = (index: 0 | 1, color: string) => {
        const newColors = [...gradient.colors] as [string, string];
        newColors[index] = color;
        handleGradientChange({ ...gradient, colors: newColors });
    };
    
    const handleGradientDirectionChange = (direction: string) => {
        handleGradientChange({ ...gradient, direction });
    };

    const handleInvertColors = () => {
        if (!fgColor) return;

        const invertedText = toggleTextColor(fgColor, backgroundStyle);

        if (updateState) {
            updateState({ textColor: invertedText });
        } else {
            if (setFgColor) setFgColor(invertedText);
        }
        
        toast({ title: 'Cor do texto invertida!' });
    };

    const handleResetGradient = () => {
        handleGradientChange({ ...gradient, colors: ['#A06CD5', '#45B8AC'] });
        toast({ title: 'Gradiente resetado!' });
    };

    const handleSwapGradientColors = () => {
        handleGradientChange({ ...gradient, colors: [gradient.colors[1], gradient.colors[0]] as [string, string] });
        toast({ title: 'Cores do gradiente alternadas!' });
    };

    const handleResetColors = () => {
        if (updateState) {
            updateState({
                textColor: '#000000',
                backgroundStyle: { type: 'solid', value: '#FFFFFF' }
            });
        } else {
            if (setFgColor) setFgColor('#000000');
            if (setBackgroundStyle) setBackgroundStyle({ type: 'solid', value: '#FFFFFF' });
        }
        toast({ title: 'Cores resetadas!' });
    };

    const handleSwapColors = () => {
        if (!fgColor) return;
        const currentBg = backgroundStyle.type === 'solid' ? backgroundStyle.value : '#000000';
        
        if (updateState) {
            updateState({
                textColor: currentBg,
                backgroundStyle: { ...backgroundStyle, type: 'solid', value: fgColor }
            });
        } else {
            if (setFgColor) setFgColor(currentBg);
            if (setBackgroundStyle) setBackgroundStyle({ ...backgroundStyle, type: 'solid', value: fgColor });
        }
        toast({ title: 'Cores alternadas!' });
    };

    const handleGradientTypeChange = (type: 'linear' | 'radial') => {
        handleGradientChange({ ...gradient, type });
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-4 gap-1">
                <Button variant={activeTab === 'media' ? "secondary" : "ghost"} onClick={() => handleTabChange('media')} className="px-1 py-1 text-xs h-9 font-medium"><ImageIcon className="mr-1 h-3.5 w-3.5 shrink-0" /> Mídia</Button>
                <Button variant={activeTab === 'solid' ? "secondary" : "ghost"} onClick={() => handleTabChange('solid')} className="px-1 py-1 text-xs h-9 font-medium"><Palette className="mr-1 h-3.5 w-3.5 shrink-0" /> Cor</Button>
                <Button variant={activeTab === 'gradient' ? "secondary" : "ghost"} onClick={() => handleTabChange('gradient')} className="px-1 py-1 text-xs h-9 font-medium"><Layers className="mr-1 h-3.5 w-3.5 shrink-0" /> Gradiente</Button>
                <Button variant={activeTab === 'vignette' ? "secondary" : "ghost"} onClick={() => handleTabChange('vignette')} className="px-1 py-1 text-xs h-9 font-medium"><div className="w-3.5 h-3.5 mr-1 rounded-sm bg-gradient-to-t from-black/60 to-transparent border border-current/50 shrink-0" /> Vinheta</Button>
            </div>
            
            <Separator />

            {activeTab === 'media' && (
                <div className="space-y-4">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,video/*,.mp4" className="hidden"/>
                    <Button onClick={() => fileInputRef.current?.click()} className="w-full" variant="outline"><Upload className="mr-2 h-4 w-4" /> Carregar do Dispositivo</Button>
                     <Link href="/galeria?fromEditor=true" passHref>
                        <Button className="w-full" variant="outline">
                            <ImageIcon className="mr-2 h-4 w-4" /> Carregar da Galeria
                        </Button>
                    </Link>
                </div>
            )}

            {activeTab === 'solid' && (
                 <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-left block">Cor do Fundo</Label>
                            <div className="relative h-10 w-full rounded-md border overflow-hidden">
                                <Input 
                                    type="color" 
                                    value={backgroundStyle.type === 'solid' ? backgroundStyle.value : '#333333'} 
                                    onChange={e => handleSolidColorChange(e.target.value)} 
                                    className="absolute inset-0 w-full h-full p-0 border-none cursor-pointer opacity-0"
                                />
                                <div className="w-full h-full" style={{ backgroundColor: backgroundStyle.type === 'solid' ? backgroundStyle.value : '#333333' }} />
                            </div>
                        </div>
                        {fgColor && setFgColor && (
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
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground block text-left">Cores Predefinidas</Label>
                        <div className="grid grid-cols-6 gap-2">
                            {PREDEFINED_COLORS.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => handleSolidColorChange(color)}
                                    style={{ backgroundColor: color }}
                                    className={cn(
                                        "h-8 w-8 rounded-md border border-muted transition-all hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                                        backgroundStyle.type === 'solid' && backgroundStyle.value.toUpperCase() === color.toUpperCase() && "ring-2 ring-primary scale-105 border-primary"
                                    )}
                                    title={color}
                                />
                            ))}
                        </div>
                    </div>
                    {fgColor && setFgColor && (
                        <div className="space-y-2 pt-2">
                            <div className="grid grid-cols-2 gap-2">
                                <Button variant="outline" size="sm" className="flex items-center justify-center gap-1.5" onClick={handleResetColors}>
                                    <RotateCcw className="h-3.5 w-3.5" />
                                    Resetar
                                </Button>
                                <Button variant="outline" size="sm" className="flex items-center justify-center gap-1.5" onClick={handleSwapColors}>
                                    <ArrowLeftRight className="h-3.5 w-3.5" />
                                    Alternar
                                </Button>
                            </div>
                            <Button variant="outline" size="sm" className="w-full flex items-center justify-center gap-1.5" onClick={handleInvertColors} title="Inverter Cor do Texto">
                                <FlipHorizontal className="h-3.5 w-3.5" />
                                Inverter Cor do Texto
                            </Button>
                        </div>
                    )}
                </div>
            )}
            
            {activeTab === 'gradient' && (
                 <div className="space-y-4">
                    <div className="flex items-end gap-2">
                         <div className="space-y-2">
                            <Label>Tipo</Label>
                            <div className="flex gap-1">
                                <Button size="sm" variant={gradient.type === 'linear' ? 'secondary' : 'outline'} onClick={() => handleGradientTypeChange('linear')}>Linear</Button>
                                <Button size="sm" variant={gradient.type === 'radial' ? 'secondary' : 'outline'} onClick={() => handleGradientTypeChange('radial')}>Radial</Button>
                            </div>
                        </div>

                        {gradient.type === 'linear' && (
                            <div className="space-y-2 flex-1">
                                <Label htmlFor="gradient-direction">Direção</Label>
                                <Select value={gradient.direction} onValueChange={handleGradientDirectionChange}>
                                    <SelectTrigger id="gradient-direction" className="h-9">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="to right">Direita</SelectItem>
                                        <SelectItem value="to left">Esquerda</SelectItem>
                                        <SelectItem value="to bottom">Abaixo</SelectItem>
                                        <SelectItem value="to top">Acima</SelectItem>
                                        <SelectItem value="to bottom right">Diag. (↓→)</SelectItem>
                                        <SelectItem value="to top left">Diag. (↑←)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label>Cores do Gradiente</Label>
                        <div className="flex items-center gap-4">
                            {[0, 1].map((index) => (
                                <div key={index} className="flex-1 space-y-1">
                                    <Label className="text-xs text-muted-foreground">Cor {index + 1}</Label>
                                    <div className="relative h-9 w-full rounded-md border overflow-hidden">
                                        <Input
                                            type="color"
                                            value={gradient.colors[index as 0 | 1]}
                                            onChange={(e) => handleGradientColorChange(index as 0 | 1, e.target.value)}
                                            className="absolute inset-0 w-full h-full p-0 border-none cursor-pointer opacity-0"
                                        />
                                        <div className="w-full h-full" style={{ backgroundColor: gradient.colors[index as 0 | 1] }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-wrap gap-2 pt-1">
                            {PREDEFINED_COLORS.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => handleGradientColorChange(0, color)}
                                    style={{ backgroundColor: color }}
                                    className="h-7 w-7 rounded-md border border-muted transition-all hover:scale-110 active:scale-95"
                                    title={`Aplicar ${color}`}
                                />
                            ))}
                        </div>
                        <div className="space-y-2 pt-2">
                            <div className="grid grid-cols-2 gap-2">
                                <Button variant="outline" size="sm" className="flex items-center justify-center gap-1.5" onClick={handleResetGradient}>
                                    <RotateCcw className="h-3.5 w-3.5" />
                                    Resetar
                                </Button>
                                <Button variant="outline" size="sm" className="flex items-center justify-center gap-1.5" onClick={handleSwapGradientColors}>
                                    <ArrowLeftRight className="h-3.5 w-3.5" />
                                    Alternar
                                </Button>
                            </div>
                            <Button variant="outline" size="sm" className="w-full flex items-center justify-center gap-1.5" onClick={handleInvertColors} title="Inverter Cor do Texto">
                                <FlipHorizontal className="h-3.5 w-3.5" />
                                Inverter Cor do Texto
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'vignette' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="vignette-enabled" className="text-left font-bold">Ativar Vinheta</Label>
                        <Switch 
                            id="vignette-enabled" 
                            checked={actualVignette.enabled} 
                            onCheckedChange={(c) => handleVignetteChange({ enabled: c })} 
                        />
                    </div>
                    
                    {actualVignette.enabled && (
                        <>
                            <div className="space-y-2">
                                <Label className="text-left block">Tipo de Vinheta</Label>
                                <Select value={actualVignette.type} onValueChange={(t: any) => handleVignetteChange({ type: t })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="bottom">De baixo para cima</SelectItem>
                                        <SelectItem value="top">De cima para baixo</SelectItem>
                                        <SelectItem value="left">Da esquerda para direita</SelectItem>
                                        <SelectItem value="right">Da direita para esquerda</SelectItem>
                                        <SelectItem value="corners">Quatro cantos</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-left block">Cor da Vinheta</Label>
                                <div className="relative h-10 w-full rounded-md border overflow-hidden">
                                    <Input 
                                        type="color" 
                                        value={actualVignette.color} 
                                        onChange={e => handleVignetteChange({ color: e.target.value })} 
                                        className="absolute inset-0 w-full h-full p-0 border-none cursor-pointer opacity-0"
                                    />
                                    <div className="w-full h-full" style={{ backgroundColor: actualVignette.color }} />
                                </div>
                            </div>

                            <div className="space-y-2 pt-2">
                                <div className="flex justify-between items-center">
                                    <Label className="text-left block">Opacidade</Label>
                                    <span className="text-xs text-muted-foreground">{Math.round(actualVignette.opacity * 100)}%</span>
                                </div>
                                <Slider 
                                    value={[actualVignette.opacity * 100]} 
                                    min={0} max={100} step={1}
                                    onValueChange={v => handleVignetteChange({ opacity: v[0] / 100 })} 
                                />
                            </div>

                            <div className="space-y-2 pt-2">
                                <div className="flex justify-between items-center">
                                    <Label className="text-left block">Intensidade</Label>
                                    <span className="text-xs text-muted-foreground">{Math.round(actualVignette.intensity * 100)}%</span>
                                </div>
                                <Slider 
                                    value={[actualVignette.intensity * 100]} 
                                    min={0} max={100} step={1}
                                    onValueChange={v => handleVignetteChange({ intensity: v[0] / 100 })} 
                                />
                            </div>

                            <div className="space-y-2 pt-2">
                                <div className="flex justify-between items-center">
                                    <Label className="text-left block">Suavidade</Label>
                                    <span className="text-xs text-muted-foreground">{Math.round(actualVignette.feather * 100)}%</span>
                                </div>
                                <Slider 
                                    value={[actualVignette.feather * 100]} 
                                    min={0} max={100} step={1}
                                    onValueChange={v => handleVignetteChange({ feather: v[0] / 100 })} 
                                />
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}
