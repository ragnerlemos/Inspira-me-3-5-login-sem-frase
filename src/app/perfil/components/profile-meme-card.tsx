"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Wand2, ImageUp, ZoomIn } from 'lucide-react';
import { ProfileData } from '@/hooks/use-profile';

interface ProfileMemeCardProps {
    profile: ProfileData;
    onMemeFontSizeChange: (value: number[]) => void;
    onMemeShowLogoChange: (value: boolean) => void;
    onMemeLogoScaleChange: (value: number[]) => void;
}

export function ProfileMemeCard({ 
    profile, 
    onMemeFontSizeChange, 
    onMemeShowLogoChange, 
    onMemeLogoScaleChange 
}: ProfileMemeCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Wand2 />
                    Meme Instantâneo
                </CardTitle>
                <CardDescription>
                    Ajuste as configurações para a geração rápida de memes na página de frases.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <Label htmlFor="meme-font-size">Tamanho da Fonte</Label>
                        <span className="text-sm font-mono text-muted-foreground">{profile.memeFontSize.toFixed(1)} pt</span>
                    </div>
                    <Slider 
                        id="meme-font-size"
                        min={1}
                        max={5}
                        step={0.1}
                        value={[profile.memeFontSize]}
                        onValueChange={onMemeFontSizeChange}
                    />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                    <Label htmlFor="meme-show-logo" className="flex items-center gap-2">
                        <ImageUp className="h-5 w-5 text-muted-foreground" />
                        Mostrar logomarca no meme
                    </Label>
                    <Switch
                        id="meme-show-logo"
                        checked={profile.memeShowLogo}
                        onCheckedChange={onMemeShowLogoChange}
                        disabled={!profile.logo}
                    />
                </div>
                {!profile.logo && <p className="text-xs text-center text-muted-foreground">Você precisa adicionar uma logomarca para usar esta opção.</p>}

                {profile.memeShowLogo && profile.logo && (
                    <div className="space-y-4 pt-4 border-t">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="meme-logo-scale" className="flex items-center gap-2"><ZoomIn className="h-5 w-5 text-muted-foreground" />Tamanho da Logomarca</Label>
                            <span className="text-sm font-mono text-muted-foreground">{profile.memeLogoScale}%</span>
                        </div>
                        <Slider 
                            id="meme-logo-scale"
                            min={10}
                            max={100}
                            step={1}
                            value={[profile.memeLogoScale]}
                            onValueChange={onMemeLogoScaleChange}
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
