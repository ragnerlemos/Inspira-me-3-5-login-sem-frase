

"use client";

import { useState, useRef, useMemo } from "react";
import Link from 'next/link';
import { Wand2, RectangleHorizontal, RectangleVertical, Square, LayoutTemplate, UserCheck, ImageUp, Paintbrush, Type, CaseSensitive, Pipette, AlignLeft, Bold, MoveVertical, Baseline, Upload, Image as ImageIcon, Palette, Layers, Check, Edit, User, MoveHorizontal, ZoomIn, AtSign, BadgePercent, Film, AlignCenter, AlignRight, Italic, Box, Pilcrow, CaseUpper, Text, SmilePlus, FlipHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { BotaoRecurso } from "../botao-recurso";
import TextareaAutosize from 'react-textarea-autosize';
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import type { ProfileData } from "@/hooks/use-profile";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { EditorState, EstiloFundo } from "../tipos";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import Image from 'next/image';
import { useTemplates } from "@/hooks/use-templates";
import { IconeTwitter } from '@/app/modelos/icone-twitter';
import { IconeModeloPadrao } from '@/app/modelos/icone-modelo-padrao';
import { Card, CardContent } from "@/components/ui/card";
import { useEditor } from "../contexts/editor-context";


const aspectRatios = [
    { label: "Story", value: "9 / 16", icon: RectangleVertical },
    { label: "Quadrado", value: "1 / 1", icon: Square },
    { label: "Vídeo", value: "16 / 9", icon: RectangleHorizontal },
];

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

function ControleTipoFundo({ backgroundStyle, setBackgroundStyle }: { backgroundStyle: EstiloFundo, setBackgroundStyle: (style: EstiloFundo) => void }) {
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
                let colors: [string, string] = ['#AOCD5', '#45B8AC'];
                
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
                    <div className="space-y-2">
                        <Label className="text-left">Cor do Fundo</Label>
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

interface CommonStyleProps {
  fontFamily: string;
  onFontFamilyChange: (font: string) => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  fontWeight: "normal" | "bold";
  onFontWeightChange: (weight: "normal" | "bold") => void;
  fontStyle: "normal" | "italic";
  onFontStyleChange: (style: "normal" | "italic") => void;
  textAlign: "left" | "center" | "right";
  onTextAlignChange: (align: "left" | "center" | "right") => void;
  textVerticalPosition: number;
  onTextVerticalPositionChange: (position: number) => void;
  textShadowBlur: number;
  onTextShadowBlurChange: (blur: number) => void;
  textShadowOpacity: number;
  onTextShadowOpacityChange: (opacity: number) => void;
  textStrokeColor: string;
  onTextStrokeColorChange: (color: string) => void;
  textStrokeWidth: number;
  onTextStrokeWidthChange: (width: number) => void;
  textStrokeCornerStyle: 'rounded' | 'square';
  onTextStrokeCornerStyleChange: (style: 'rounded' | 'square') => void;
  applyEffectsToEmojis: boolean;
  onApplyEffectsToEmojisChange: (apply: boolean) => void;
  letterSpacing: number;
  onLetterSpacingChange: (spacing: number) => void;
  lineHeight: number;
  onLineHeightChange: (height: number) => void;
  wordSpacing: number;
  onWordSpacingChange: (spacing: number) => void;
}


interface ControleAssinaturaProps {
  showProfileSignature: boolean;
  onShowProfileSignatureChange: (show: boolean) => void;
  signaturePositionX: number;
  onSignaturePositionXChange: (x: number) => void;
  signaturePositionY: number;
  onSignaturePositionYChange: (y: number) => void;
  signatureScale: number;
  onSignatureScaleChange: (scale: number) => void;
  showSignaturePhoto: boolean;
  onShowSignaturePhotoChange: (show: boolean) => void;
  showSignatureUsername: boolean;
  onShowSignatureUsernameChange: (show: boolean) => void;
  showSignatureSocial: boolean;
  onShowSignatureSocialChange: (show: boolean) => void;
  showSignatureBackground: boolean;
  onShowSignatureBackgroundChange: (show: boolean) => void;
  signatureBgColor: string;
  onSignatureBgColorChange: (color: string) => void;
  signatureBgOpacity: number;
  onSignatureBgOpacityChange: (opacity: number) => void;
  profile: ProfileData;
}
function ControleAssinatura(props: ControleAssinaturaProps) {
    const { 
        showProfileSignature, onShowProfileSignatureChange,
        signaturePositionX, onSignaturePositionXChange,
        signaturePositionY, onSignaturePositionYChange,
        signatureScale, onSignatureScaleChange,
        showSignaturePhoto, onShowSignaturePhotoChange,
        showSignatureUsername, onShowSignatureUsernameChange,
        showSignatureSocial, onShowSignatureSocialChange,
        showSignatureBackground, onShowSignatureBackgroundChange,
        signatureBgColor, onSignatureBgColorChange,
        signatureBgOpacity, onSignatureBgOpacityChange,
        profile,
    } = props;
    
    const isProfileConfigured = profile.username && profile.username !== 'Seu Nome' && profile.social && profile.social !== '@seuusario';

     return (
        <div className="space-y-4">
            <Button 
                variant={showProfileSignature ? 'secondary' : 'outline'} 
                onClick={() => onShowProfileSignatureChange(!showProfileSignature)}
                className="w-full"
            >
                {showProfileSignature ? <Check className="mr-2 h-4 w-4" /> : <Edit className="mr-2 h-4 w-4" />}
                {showProfileSignature ? 'Assinatura Ativada' : 'Ativar Assinatura'}
            </Button>
            
            <LinkConfigurarPerfil />



            {showProfileSignature && (
                <div className="space-y-4 pt-2 border-t mt-4">
                    <Label>Elementos Visíveis</Label>
                    <div className="grid grid-cols-4 gap-2">
                         <Button size="sm" variant={showSignaturePhoto ? 'secondary' : 'outline'} onClick={() => onShowSignaturePhotoChange(!showSignaturePhoto)}>
                             <ImageIcon className="mr-2 h-4 w-4" /> Foto
                        </Button>
                         <Button size="sm" variant={showSignatureUsername ? 'secondary' : 'outline'} onClick={() => onShowSignatureUsernameChange(!showSignatureUsername)}>
                            <CaseSensitive className="mr-2 h-4 w-4" /> Nome
                        </Button>
                         <Button size="sm" variant={showSignatureSocial ? 'secondary' : 'outline'} onClick={() => onShowSignatureSocialChange(!showSignatureSocial)}>
                            <AtSign className="mr-2 h-4 w-4" /> Social
                        </Button>
                        <Button size="sm" variant={showSignatureBackground ? 'secondary' : 'outline'} onClick={() => onShowSignatureBackgroundChange(!showSignatureBackground)}>
                           <Box className="mr-2 h-4 w-4" /> Fundo
                        </Button>
                    </div>

                    {showSignatureBackground && (
                         <div className="space-y-4 pt-4 border-t">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label className="text-xs flex items-center"><Pipette className="mr-2 h-3 w-3" />Cor do Fundo</Label>
                                    <Input
                                        type="color"
                                        value={signatureBgColor}
                                        onChange={(e) => onSignatureBgColorChange(e.target.value)}
                                        className="h-6 w-10 p-0 border-none cursor-pointer"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="signature-bg-opacity" className="text-xs flex items-center"><BadgePercent className="mr-2 h-3 w-3" />Opacidade do Fundo</Label>
                                    <span className="text-xs text-muted-foreground">{signatureBgOpacity}%</span>
                                </div>
                                <Slider id="signature-bg-opacity" min={0} max={100} step={1} value={[signatureBgOpacity]} onValueChange={(v) => onSignatureBgOpacityChange(v[0])}/>
                            </div>
                        </div>
                    )}
                     <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="signature-position-x" className="text-xs flex items-center"><MoveHorizontal className="mr-2 h-3 w-3" />Posição Horizontal</Label>
                            <span className="text-xs text-muted-foreground">{signaturePositionX}%</span>
                        </div>
                        <Slider id="signature-position-x" min={0} max={100} step={1} value={[signaturePositionX]} onValueChange={(value) => onSignaturePositionXChange(value[0])}/>
                    </div>
                     <div className="space-y-2">
                         <div className="flex justify-between items-center">
                            <Label htmlFor="signature-position-y" className="text-xs flex items-center"><MoveVertical className="mr-2 h-3 w-3" />Posição Vertical</Label>
                            <span className="text-xs text-muted-foreground">{signaturePositionY}%</span>
                        </div>
                        <Slider id="signature-position-y" min={0} max={100} step={1} value={[signaturePositionY]} onValueChange={(value) => onSignaturePositionYChange(value[0])}/>
                    </div>
                    <div className="space-y-2">
                         <div className="flex justify-between items-center">
                            <Label htmlFor="signature-scale" className="text-xs flex items-center"><ZoomIn className="mr-2 h-3 w-3" />Escala</Label>
                            <span className="text-xs text-muted-foreground">{signatureScale}%</span>
                        </div>
                        <Slider id="signature-scale" min={50} max={150} step={1} value={[signatureScale]} onValueChange={(value) => onSignatureScaleChange(value[0])}/>
                    </div>
                </div>
            )}
        </div>
     )
}

interface ControleLogoProps {
    showLogo: boolean;
    onShowLogoChange: (show: boolean) => void;
    logoPositionX: number;
    onLogoPositionXChange: (x: number) => void;
    logoPositionY: number;
    onLogoPositionYChange: (y: number) => void;
    logoScale: number;
    onLogoScaleChange: (scale: number) => void;
    logoOpacity: number;
    onLogoOpacityChange: (opacity: number) => void;
    profile: ProfileData;
}
function ControleLogo(props: ControleLogoProps) {
    const {
        showLogo, onShowLogoChange,
        logoPositionX, onLogoPositionXChange,
        logoPositionY, onLogoPositionYChange,
        logoScale, onLogoScaleChange,
        logoOpacity, onLogoOpacityChange,
        profile,
    } = props;
    
    const isLogoConfigured = !!profile.logo;

    return (
        <div className="space-y-4">
            <Button
                variant={showLogo ? 'secondary' : 'outline'}
                onClick={() => onShowLogoChange(!showLogo)}
                className="w-full"
                disabled={!isLogoConfigured}
            >
                {showLogo ? <Check className="mr-2 h-4 w-4" /> : <Edit className="mr-2 h-4 w-4" />}
                {showLogo ? 'Logomarca Ativada' : 'Ativar Logomarca'}
            </Button>
            
            {!isLogoConfigured && <LinkConfigurarPerfil />}


            {showLogo && isLogoConfigured && (
                <div className="space-y-4 pt-2 border-t mt-4">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="logo-position-x" className="text-xs flex items-center"><MoveHorizontal className="mr-2 h-3 w-3" />Posição Horizontal</Label>
                            <span className="text-xs text-muted-foreground">{logoPositionX}%</span>
                        </div>
                        <Slider id="logo-position-x" min={0} max={100} step={1} value={[logoPositionX]} onValueChange={(v) => onLogoPositionXChange(v[0])} />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="logo-position-y" className="text-xs flex items-center"><MoveVertical className="mr-2 h-3 w-3" />Posição Vertical</Label>
                            <span className="text-xs text-muted-foreground">{logoPositionY}%</span>
                        </div>
                        <Slider id="logo-position-y" min={0} max={100} step={1} value={[logoPositionY]} onValueChange={(v) => onLogoPositionYChange(v[0])} />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="logo-scale" className="text-xs flex items-center"><ZoomIn className="mr-2 h-3 w-3" />Escala</Label>
                            <span className="text-xs text-muted-foreground">{logoScale}%</span>
                        </div>
                        <Slider id="logo-scale" min={10} max={200} step={1} value={[logoScale]} onValueChange={(v) => onLogoScaleChange(v[0])} />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="logo-opacity" className="text-xs flex items-center"><BadgePercent className="mr-2 h-3 w-3" />Opacidade</Label>
                            <span className="text-xs text-muted-foreground">{logoOpacity}%</span>
                        </div>
                        <Slider id="logo-opacity" min={0} max={100} step={1} value={[logoOpacity]} onValueChange={(v) => onLogoOpacityChange(v[0])} />
                    </div>
                </div>
            )}
        </div>
    )
}

type EstiloControlProps = CommonStyleProps & {
    fgColor: string;
    onFgColorChange: (color: string) => void;
};

function renderEstiloControl(subControl: string | null, props: EstiloControlProps) {
    if (!subControl) return <p className="text-center text-muted-foreground text-sm">Selecione um controle de estilo abaixo.</p>;

    switch (subControl) {
        case 'fonte':
            return (
                <div className="space-y-2">
                    <Label htmlFor="font-family">Fonte</Label>
                    <Select value={props.fontFamily} onValueChange={props.onFontFamilyChange}>
                        <SelectTrigger id="font-family"><SelectValue placeholder="Selecione a fonte" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Poppins">Poppins</SelectItem>
                            <SelectItem value="PT Sans">PT Sans</SelectItem>
                            <SelectItem value="Merriweather">Merriweather</SelectItem>
                            <SelectItem value="Lobster">Lobster</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            );
        case 'tamanho':
            return (
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Label htmlFor="font-size">Tamanho da Fonte</Label>
                        <span className="text-sm text-muted-foreground">{props.fontSize.toFixed(1)} pt</span>
                    </div>
                    <Slider id="font-size" min={1} max={20} step={0.1} value={[props.fontSize]} onValueChange={(v) => props.onFontSizeChange(v[0])} />
                </div>
            );
        case 'cor':
            return (
                <div className="space-y-2">
                    <Label>Cor do Texto</Label>
                    <div className="relative h-10 w-full rounded-md border overflow-hidden">
                       <Input
                            type="color"
                            value={props.fgColor}
                            onChange={(e) => props.onFgColorChange(e.target.value)}
                            className="absolute inset-0 w-full h-full p-0 border-none cursor-pointer opacity-0"
                        />
                        <div className="w-full h-full" style={{ backgroundColor: props.fgColor }} />
                    </div>
                </div>
            );
        case 'alinhamento':
            return (
                <div className="space-y-2">
                    <Label>Alinhamento do Texto</Label>
                    <div className="grid grid-cols-3 gap-2">
                        <BotaoRecurso icon={AlignLeft} label="Esquerda" onClick={() => props.onTextAlignChange('left')} isActive={props.textAlign === 'left'} />
                        <BotaoRecurso icon={AlignCenter} label="Centro" onClick={() => props.onTextAlignChange('center')} isActive={props.textAlign === 'center'} />
                        <BotaoRecurso icon={AlignRight} label="Direita" onClick={() => props.onTextAlignChange('right')} isActive={props.textAlign === 'right'} />
                    </div>
                </div>
            );
        case 'estilo':
            return (
                 <div className="space-y-2">
                    <Label>Estilo</Label>
                    <div className="grid grid-cols-2 gap-2">
                        <Button variant={props.fontWeight === 'bold' ? 'secondary' : 'ghost'} onClick={() => props.onFontWeightChange(props.fontWeight === 'bold' ? 'normal' : 'bold')}><Bold className="mr-2" />Negrito</Button>
                        <Button variant={props.fontStyle === 'italic' ? 'secondary' : 'ghost'} onClick={() => props.onFontStyleChange(props.fontStyle === 'italic' ? 'normal' : 'italic')}><Italic className="mr-2" />Itálico</Button>
                    </div>
                </div>
            );
        case 'posicao':
             return (
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <Label htmlFor="vertical-position" className="flex items-center"><MoveVertical className="mr-2 h-4 w-4" />Posição Vertical</Label>
                            <span className="text-sm text-muted-foreground">{props.textVerticalPosition}%</span>
                        </div>
                        <Slider id="vertical-position" min={0} max={100} step={1} value={[props.textVerticalPosition]} onValueChange={(v) => props.onTextVerticalPositionChange(v[0])} />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="letter-spacing" className="flex items-center"><CaseUpper className="mr-2 h-4 w-4" />Espaç. Letras</Label>
                            <span className="text-sm text-muted-foreground">{(props.letterSpacing / 10).toFixed(1)}</span>
                        </div>
                        <Slider id="letter-spacing" min={-10} max={50} step={0.5} value={[props.letterSpacing]} onValueChange={(v) => props.onLetterSpacingChange(v[0])} />
                    </div>
                     <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="word-spacing" className="flex items-center"><Text className="mr-2 h-4 w-4" />Espaç. Palavras</Label>
                            <span className="text-sm text-muted-foreground">{(props.wordSpacing / 10).toFixed(1)}</span>
                        </div>
                        <Slider id="word-spacing" min={-10} max={50} step={0.5} value={[props.wordSpacing]} onValueChange={(v) => props.onWordSpacingChange(v[0])} />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="line-height" className="flex items-center"><Pilcrow className="mr-2 h-4 w-4" />Altura da Linha</Label>
                            <span className="text-sm text-muted-foreground">{props.lineHeight.toFixed(2)}</span>
                        </div>
                        <Slider id="line-height" min={0.8} max={2.5} step={0.05} value={[props.lineHeight]} onValueChange={(v) => props.onLineHeightChange(v[0])} />
                    </div>
                </div>
            );
        case 'contorno':
             return (
                 <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Tipo de Canto</Label>
                        <div className="grid grid-cols-2 gap-2">
                            <Button variant={props.textStrokeCornerStyle === 'rounded' ? 'secondary' : 'outline'} onClick={() => props.onTextStrokeCornerStyleChange('rounded')}>Arredondado</Button>
                            <Button variant={props.textStrokeCornerStyle === 'square' ? 'secondary' : 'outline'} onClick={() => props.onTextStrokeCornerStyleChange('square')}>Quadrado</Button>
                        </div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                        <Label htmlFor="stroke-color" className="text-xs text-muted-foreground">Cor</Label>
                         <div className="relative h-10 w-full rounded-md border overflow-hidden">
                            <Input
                                type="color"
                                value={props.textStrokeColor}
                                onChange={(e) => props.onTextStrokeColorChange(e.target.value)}
                                className="absolute inset-0 w-full h-full p-0 border-none cursor-pointer opacity-0"
                            />
                             <div className="w-full h-full" style={{ backgroundColor: props.textStrokeColor }} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="stroke-width" className="text-xs text-muted-foreground">Espessura</Label>
                            <span className="text-xs text-muted-foreground">{props.textStrokeWidth.toFixed(1)} pt</span>
                        </div>
                        <Slider id="stroke-width" min={0} max={20} step={0.1} value={[props.textStrokeWidth]} onValueChange={(v) => props.onTextStrokeWidthChange(v[0])} />
                    </div>
                </div>
            );
        case 'sombra':
             return (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="shadow-blur" className="text-xs text-muted-foreground">Desfoque</Label>
                            <span className="text-xs text-muted-foreground">{props.textShadowBlur.toFixed(1)} pt</span>
                        </div>
                        <Slider id="shadow-blur" min={0} max={10} step={0.1} value={[props.textShadowBlur]} onValueChange={(v) => props.onTextShadowBlurChange(v[0])} />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="shadow-opacity" className="text-xs text-muted-foreground">Intensidade</Label>
                            <span className="text-xs text-muted-foreground">{props.textShadowOpacity}%</span>
                        </div>
                        <Slider id="shadow-opacity" min={0} max={100} step={1} value={[props.textShadowOpacity]} onValueChange={(v) => props.onTextShadowOpacityChange(v[0])} />
                    </div>
                </div>
            );
        case 'emoji':
            return (
                <div className="space-y-4">
                     <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                            <Label htmlFor="apply-emoji-effects">Aplicar efeitos em emojis</Label>
                            <p className="text-xs text-muted-foreground">
                                Desative para manter os emojis com aparência padrão.
                            </p>
                        </div>
                        <Switch
                            id="apply-emoji-effects"
                            checked={props.applyEffectsToEmojis}
                            onCheckedChange={props.onApplyEffectsToEmojisChange}
                        />
                    </div>
                </div>
            )
        default:
            return null;
    }
}

function LinkConfigurarPerfil() {
    return (
      <Link href="/perfil" passHref>
        <Button variant="link" className="w-full text-center">
          <ImageUp className="mr-2 h-4 w-4" />
          Configurar Perfil
        </Button>
      </Link>
    );
}

export function ControleModelos() {
    const { templates, isLoaded } = useTemplates();
    const { applyTemplate } = useEditor();

    if (!isLoaded) {
        return <div className="p-4 text-center text-muted-foreground text-sm">Carregando modelos...</div>;
    }

    const defaultTemplates = templates.filter(t => !t.isCustom);
    const customTemplates = templates.filter(t => t.isCustom);

    return (
        <div className="space-y-6">
            <div>
                <Label className="text-sm font-semibold mb-2 block">Padrões</Label>
                <div className="grid grid-cols-3 gap-2">
                    {defaultTemplates.map((template) => (
                        <div key={template.id} onClick={() => applyTemplate(template.editorState, 'merge')} className="cursor-pointer group">
                             <Card className="overflow-hidden flex flex-col h-full bg-transparent border shadow-sm hover:border-primary transition-colors">
                                <div className="relative w-full aspect-square flex items-center justify-center bg-muted/30">
                                    {template.thumbnail ? (
                                        <Image
                                            src={template.thumbnail}
                                            alt={template.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full p-2">
                                            {template.id === 'template-default' && <IconeModeloPadrao className="h-8 w-8 text-muted-foreground/50" />}
                                            {template.id === 'template-twitter' && <IconeTwitter className="h-8 w-8 text-muted-foreground/50" />}
                                        </div>
                                    )}
                                </div>
                             </Card>
                             <p className="text-[10px] text-center mt-1 truncate text-muted-foreground group-hover:text-foreground">{template.name}</p>
                        </div>
                    ))}
                </div>
            </div>

            {customTemplates.length > 0 && (
                <div>
                    <Label className="text-sm font-semibold mb-2 block">Meus Modelos</Label>
                    <div className="grid grid-cols-3 gap-2">
                        {customTemplates.map((template) => (
                            <div key={template.id} onClick={() => applyTemplate(template.editorState, 'merge')} className="cursor-pointer group">
                                <Card className="overflow-hidden flex flex-col h-full border shadow-sm hover:border-primary transition-colors">
                                    <div className="relative w-full aspect-square">
                                        {template.thumbnail && (
                                            <Image
                                                src={template.thumbnail}
                                                alt={template.name}
                                                fill
                                                className="object-cover"
                                            />
                                        )}
                                    </div>
                                </Card>
                                <p className="text-[10px] text-center mt-1 truncate text-muted-foreground group-hover:text-foreground">{template.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

interface SidebarProps extends ControleAssinaturaProps, ControleLogoProps, CommonStyleProps {
    aspectRatio: string;
    setAspectRatio: (ratio: string) => void;
    scale: number;
    setScale: (scale: number) => void;
    backgroundStyle: EstiloFundo;
    setBackgroundStyle: (style: EstiloFundo) => void;
    filmColor: string;
    setFilmColor: (color: string) => void;
    filmOpacity: number;
    setFilmOpacity: (opacity: number) => void;
    fgColor: string;
    setFgColor: (color: string) => void;
    activeControl: string | null;
    setActiveControl: (control: string | null) => void;
    text: string;
    setText: (text: string) => void;
    profile: ProfileData;
    updateState: (newState: Partial<EditorState>) => void;
}

export function Sidebar({
    activeControl,
    setActiveControl,
    text,
    setText,
    aspectRatio,
    setAspectRatio,
    scale,
    setScale,
    backgroundStyle,
    setBackgroundStyle,
    filmColor,
    setFilmColor,
    filmOpacity,
    setFilmOpacity,
    fgColor,
    setFgColor,
    updateState,
    ...props
}: SidebarProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [activeSubControl, setActiveSubControl] = useState<string | null>(null);

    const handleSetControleAtivo = (controle: string | null) => {
        setActiveControl(controle);
        if (controle !== 'estilo') {
            setActiveSubControl(null);
        }
    }
    
    const handleInvertColors = () => {
        if (backgroundStyle.type === 'solid') {
            // Fundo sólido: troca cor do fundo com cor do texto
            const newBgColor = fgColor;
            const newFgColor = backgroundStyle.value;
            
            updateState({
                backgroundStyle: { type: 'solid', value: newBgColor },
                textColor: newFgColor,
            });
        } else {
            // Fundo com mídia ou gradiente: inverte a cor do texto (claro↔escuro)
            const hex = fgColor.replace('#', '');
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            const invertedR = (255 - r).toString(16).padStart(2, '0');
            const invertedG = (255 - g).toString(16).padStart(2, '0');
            const invertedB = (255 - b).toString(16).padStart(2, '0');
            const invertedColor = `#${invertedR}${invertedG}${invertedB}`;
            
            updateState({ textColor: invertedColor });
            toast({ title: 'Cor do texto invertida!' });
        }
    };
    
    const bgColor = backgroundStyle.type === 'solid' ? backgroundStyle.value : '#000000';

    const renderActiveControl = () => {
        if (!activeControl) {
            return <p className="text-sm text-muted-foreground text-center p-4">Selecione uma ferramenta para editar.</p>;
        }
        switch (activeControl) {
            case 'texto':
                return (
                    <div className="p-4 flex-1 flex flex-col">
                        <Label htmlFor="text-input" className="sr-only">Texto da Frase</Label>
                        <TextareaAutosize
                            id="text-input"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            minRows={6}
                            placeholder="Digite sua frase aqui..."
                            className={cn(
                                'flex w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm'
                            )}
                        />
                    </div>
                );
            case 'canvas':
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
            case 'cores':
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

                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground block text-left">Cores de Fundo Predefinidas</Label>
                            <div className="grid grid-cols-6 gap-2">
                                {PREDEFINED_COLORS.map((color) => (
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

                        <Button variant="outline" className="w-full flex items-center gap-2" onClick={handleInvertColors}>
                            <FlipHorizontal className="h-4 w-4" />
                            Inverter Cores
                        </Button>
                    </div>
                 );
            case 'filtro':
                return (
                    <div className="space-y-4 p-4">
                        <div className="space-y-2">
                            <Label>Cor da Película</Label>
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
                            <Slider id="film-opacity" min={0} max={100} step={1} value={[filmOpacity]} onValueChange={(v) => setFilmOpacity(v[0])} />
                            <div className="flex justify-between gap-1">
                                {[0, 20, 40, 50, 60, 75, 80, 85, 90].map((val) => (
                                    <Button key={val} variant="outline" size="sm" className="h-7 flex-1 text-xs px-0" onClick={() => setFilmOpacity(val)}>
                                        {val}%
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case 'estilo':
                 return (
                     <div className="w-full flex-1 flex flex-col">
                        <div className="p-4 flex-1 overflow-y-auto">
                            {renderEstiloControl(activeSubControl, { ...props, fgColor, onFgColorChange: setFgColor })}
                        </div>
                        <ScrollArea className="w-full whitespace-nowrap border-t mt-auto">
                            <div className="flex h-16 items-center w-max space-x-1 bg-background/90 backdrop-blur-sm px-2">
                                <BotaoRecurso icon={Baseline} label="Contorno" onClick={() => setActiveSubControl('contorno')} isActive={activeSubControl === 'contorno'}/>
                                <BotaoRecurso icon={SmilePlus} label="Emoji" onClick={() => setActiveSubControl('emoji')} isActive={activeSubControl === 'emoji'} />
                                <BotaoRecurso icon={Paintbrush} label="Sombra" onClick={() => setActiveSubControl('sombra')} isActive={activeSubControl === 'sombra'}/>
                                <BotaoRecurso icon={Pipette} label="Cor" onClick={() => setActiveSubControl('cor')} isActive={activeSubControl === 'cor'}/>
                                <BotaoRecurso icon={CaseSensitive} label="Tamanho" onClick={() => setActiveSubControl('tamanho')} isActive={activeSubControl === 'tamanho'}/>
                                <BotaoRecurso icon={MoveVertical} label="Posição" onClick={() => setActiveSubControl('posicao')} isActive={activeSubControl === 'posicao'}/>
                                <BotaoRecurso icon={AlignLeft} label="Alinhar" onClick={() => setActiveSubControl('alinhamento')} isActive={activeSubControl === 'alinhamento'}/>
                                <BotaoRecurso icon={Bold} label="Estilo" onClick={() => setActiveSubControl('estilo')} isActive={activeSubControl === 'estilo'}/>
                                <BotaoRecurso icon={Type} label="Fonte" onClick={() => setActiveSubControl('fonte')} isActive={activeSubControl === 'fonte'}/>
                            </div>
                            <ScrollBar orientation="horizontal" className="h-2" />
                        </ScrollArea>
                     </div>
                 );
            case 'fundo':
                return <div className="p-4"><ControleTipoFundo backgroundStyle={backgroundStyle} setBackgroundStyle={setBackgroundStyle} /></div>;
            case 'modelos':
                return <div className="p-4"><ControleModelos /></div>;
            case 'assinatura':
                return <div className="p-4"><ControleAssinatura {...props} /></div>;
            case 'logo':
                return <div className="p-4"><ControleLogo {...props} /></div>;
            default:
                return null;
        }
    }

    const mainToolbar = (
        <ScrollArea className="w-full border-b">
            <div className="flex h-16 items-center justify-around w-full space-x-1 px-2">
                <BotaoRecurso icon={Type} label="Texto" onClick={() => handleSetControleAtivo('texto')} isActive={activeControl === 'texto'}/>
                <BotaoRecurso icon={RectangleHorizontal} label="Canvas" onClick={() => handleSetControleAtivo('canvas')} isActive={activeControl === 'canvas'}/>
                <BotaoRecurso icon={Paintbrush} label="Cores" onClick={() => handleSetControleAtivo('cores')} isActive={activeControl === 'cores'}/>
                <BotaoRecurso icon={Wand2} label="Estilo" onClick={() => handleSetControleAtivo('estilo')} isActive={activeControl === 'estilo'}/>
                <BotaoRecurso icon={LayoutTemplate} label="Fundo" onClick={() => handleSetControleAtivo('fundo')} isActive={activeControl === 'fundo'}/>
                <BotaoRecurso icon={Film} label="Película" onClick={() => handleSetControleAtivo('filtro')} isActive={activeControl === 'filtro'} />
                <BotaoRecurso icon={LayoutTemplate} label="Modelos" onClick={() => handleSetControleAtivo('modelos')} isActive={activeControl === 'modelos'}/>
                <BotaoRecurso icon={UserCheck} label="Assinatura" onClick={() => handleSetControleAtivo('assinatura')} isActive={activeControl === 'assinatura'}/>
                <BotaoRecurso icon={ImageUp} label="Logo" onClick={() => handleSetControleAtivo('logo')} isActive={activeControl === 'logo'}/>
            </div>
            <ScrollBar orientation="horizontal" className="h-2" />
        </ScrollArea>
    );

    return (
        <aside className="hidden shrink-0 bg-card md:flex md:flex-col md:border-r w-full h-full">
            
            {mainToolbar}

            <div className="flex-1 overflow-y-auto flex flex-col">
                {renderActiveControl()}
            </div>
        </aside>
    );
}
