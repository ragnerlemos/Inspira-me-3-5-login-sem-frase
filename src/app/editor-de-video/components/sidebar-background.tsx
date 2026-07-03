"use client";

import { useRef, useMemo } from "react";
import Link from 'next/link';
import { Upload, Image as ImageIcon, Palette, Layers, Pipette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { EstiloFundo } from "../tipos";

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

type TipoFundoAtivo = 'media' | 'solid' | 'gradient';

export function ControleTipoFundo({ 
    backgroundStyle, 
    setBackgroundStyle, 
    fgColor, 
    setFgColor 
}: { 
    backgroundStyle: EstiloFundo; 
    setBackgroundStyle: (style: EstiloFundo) => void; 
    fgColor?: string; 
    setFgColor?: (color: string) => void; 
}) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    
    const { activeTab, gradient } = useMemo(() => {
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
        return { activeTab: type, gradient: grad };
    }, [backgroundStyle]);

    const handleTabChange = (tab: TipoFundoAtivo) => {
        if (tab === 'solid') {
            setBackgroundStyle({ type: 'solid', value: '#333333' });
        } else if (tab === 'gradient') {
            const gradValue = `${gradient.type}-gradient(${gradient.type === 'linear' ? `${gradient.direction}, ` : `circle at center, `}${gradient.colors[0]}, ${gradient.colors[1]})`;
            setBackgroundStyle({ type: 'gradient', value: gradValue });
        } else { // media
             setBackgroundStyle({ type: 'media', value: '' });
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

    const handleGradientTypeChange = (type: 'linear' | 'radial') => {
        handleGradientChange({ ...gradient, type });
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
                <Button variant={activeTab === 'media' ? "secondary" : "ghost"} onClick={() => handleTabChange('media')}><ImageIcon className="mr-2 h-4 w-4" /> Mídia</Button>
                <Button variant={activeTab === 'solid' ? "secondary" : "ghost"} onClick={() => handleTabChange('solid')}><Palette className="mr-2 h-4 w-4" /> Cor</Button>
                <Button variant={activeTab === 'gradient' ? "secondary" : "ghost"} onClick={() => handleTabChange('gradient')}><Layers className="mr-2 h-4 w-4" /> Gradiente</Button>
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
                    </div>
                </div>
            )}
        </div>
    )
}
