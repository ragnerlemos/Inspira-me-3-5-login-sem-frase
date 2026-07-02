"use client";

import React, { useRef } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { User, Link as LinkIcon, Edit2, Upload, ImageUp } from 'lucide-react';
import { ProfileData } from '@/hooks/use-profile';

interface ProfileEditCardProps {
    profile: ProfileData;
    onProfileChange: (field: keyof ProfileData, value: string | boolean | number) => void;
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>, field: 'photo' | 'logo' | 'logo2') => void;
}

export function ProfileEditCard({ profile, onProfileChange, onFileUpload }: ProfileEditCardProps) {
    const photoFileInputRef = useRef<HTMLInputElement>(null);
    const logo1FileInputRef = useRef<HTMLInputElement>(null);
    const logo2FileInputRef = useRef<HTMLInputElement>(null);

    return (
        <Card className="border-slate-800 bg-[#020817]/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-bold"><Edit2 /> Identidade da Marca</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="username" className="flex items-center gap-2 text-primary"><User />Nome de Usuário</Label>
                    <Input
                        id="username"
                        value={profile.username}
                        onChange={(e) => onProfileChange('username', e.target.value)}
                        placeholder="Seu nome..."
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="social" className="flex items-center gap-2 text-primary"><LinkIcon />Rede Social</Label>
                    <Input
                        id="social"
                        value={profile.social}
                        onChange={(e) => onProfileChange('social', e.target.value)}
                        placeholder="@seuusuario..."
                    />
                </div>
                <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-primary"><Upload />Foto de Perfil</Label>
                    <div className="flex gap-4 items-start">
                        <div className="flex-1 space-y-2">
                            <input
                                type="file"
                                ref={photoFileInputRef}
                                onChange={(e) => onFileUpload(e, 'photo')}
                                className="hidden"
                                accept="image/*"
                            />
                            <Button onClick={() => photoFileInputRef.current?.click()} variant="outline" className="w-full">
                                Carregar Nova Foto
                            </Button>
                        </div>
                        <div className="w-16 h-16 rounded-full border-2 border-slate-800 bg-slate-900/50 flex-shrink-0 overflow-hidden relative">
                            {profile.photo ? (
                                <Image src={profile.photo} alt="Preview" fill className="object-cover" referrerPolicy="no-referrer" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-700">
                                    <User className="w-8 h-8" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <Separator />

                <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-primary"><ImageUp />Logomarca 1</Label>
                    <div className="flex gap-4 items-start">
                        <div className="flex-1 space-y-2">
                            <input
                                type="file"
                                ref={logo1FileInputRef}
                                onChange={(e) => onFileUpload(e, 'logo')}
                                className="hidden"
                                accept="image/*"
                            />
                            <Button onClick={() => logo1FileInputRef.current?.click()} variant="outline" className="w-full">
                                Carregar Logomarca 1
                            </Button>
                            <div className="relative">
                                <Input
                                    id="logo-url"
                                    value={profile.logo || ''}
                                    onChange={(e) => onProfileChange('logo', e.target.value)}
                                    placeholder="Ou cole o link da imagem aqui"
                                />
                            </div>
                        </div>
                        <div className="w-16 h-16 rounded-lg border-2 border-slate-800 bg-slate-900/50 flex-shrink-0 overflow-hidden relative p-1">
                            {profile.logo ? (
                                <Image src={profile.logo} alt="Logo 1" fill className="object-contain" referrerPolicy="no-referrer" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-700">
                                    <ImageUp className="w-8 h-8" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                <Separator />

                <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-primary"><ImageUp />Logomarca 2</Label>
                    <div className="flex gap-4 items-start">
                        <div className="flex-1 space-y-2">
                            <input
                                type="file"
                                ref={logo2FileInputRef}
                                onChange={(e) => onFileUpload(e, 'logo2')}
                                className="hidden"
                                accept="image/*"
                            />
                            <Button onClick={() => logo2FileInputRef.current?.click()} variant="outline" className="w-full">
                                Carregar Logomarca 2
                            </Button>
                            <div className="relative">
                                <Input
                                    id="logo2-url"
                                    value={profile.logo2 || ''}
                                    onChange={(e) => onProfileChange('logo2', e.target.value)}
                                    placeholder="Ou cole o link da imagem aqui"
                                />
                            </div>
                        </div>
                        <div className="w-16 h-16 rounded-lg border-2 border-slate-800 bg-slate-900/50 flex-shrink-0 overflow-hidden relative p-1">
                            {profile.logo2 ? (
                                <Image src={profile.logo2} alt="Logo 2" fill className="object-contain" referrerPolicy="no-referrer" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-700">
                                    <ImageUp className="w-8 h-8" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <p className="text-xs text-muted-foreground text-center pt-1">
                    Use imagens com fundo transparente (PNG) para melhores resultados.
                </p>
            </CardContent>
        </Card>
    );
}
