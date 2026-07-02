"use client";

import { 
    Baseline, Paintbrush, Pipette, CaseSensitive, MoveVertical, 
    AlignLeft, Bold, Type, AlignCenter, AlignRight, Italic, 
    CaseUpper, Text, Pilcrow, SmilePlus 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { BotaoRecurso } from "../botao-recurso";

export interface CommonStyleProps {
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

export type EstiloControlProps = CommonStyleProps & {
    fgColor: string;
    onFgColorChange: (color: string) => void;
    activeSubControl: string | null;
};

export function SidebarEstiloTexto({ activeSubControl, ...props }: EstiloControlProps) {
    if (!activeSubControl) return <p className="text-center text-muted-foreground text-sm">Selecione um controle de estilo abaixo.</p>;

    switch (activeSubControl) {
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
