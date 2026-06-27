
"use client";

import React, { useRef, useMemo } from 'react';
import { useProfile } from '@/hooks/use-profile';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Link as LinkIcon, Edit2, Upload, Eye, EyeOff, Calendar, ImageUp, Twitter, Wand2, ZoomIn } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

export const dynamic = 'force-dynamic';

function ProfileSkeleton() {
    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
             <div className="text-center mb-8">
                <Skeleton className="h-10 w-64 mx-auto" />
                <Skeleton className="h-5 w-80 mx-auto mt-3" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <Skeleton className="h-[400px] w-full" />
                </div>
                 <div>
                    <Skeleton className="h-[300px] w-full" />
                </div>
            </div>
        </div>
    )
}

// Página de Perfil para o usuário editar suas informações.
export default function ProfilePage() {
  const { profile, updateProfile, isLoaded } = useProfile();
  const { toast } = useToast();
  const photoFileInputRef = useRef<HTMLInputElement>(null);
  const logo1FileInputRef = useRef<HTMLInputElement>(null);
  const logo2FileInputRef = useRef<HTMLInputElement>(null);

  const handleProfileChange = (field: keyof typeof profile, value: string | boolean) => {
    updateProfile({ [field]: value });
  };


  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'photo' | 'logo' | 'logo2') => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          variant: 'destructive',
          title: 'Arquivo Inválido',
          description: 'Por favor, selecione um arquivo de imagem.',
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        updateProfile({ [field]: reader.result as string });
         toast({
          title: `${field === 'photo' ? 'Foto' : 'Logomarca'} Atualizada!`,
          description: `Sua ${field === 'photo' ? 'foto de perfil' : 'logomarca'} foi alterada com sucesso.`,
        });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleMemeFontSizeChange = (value: number[]) => {
    updateProfile({ memeFontSize: value[0] });
  };
  
  const handleMemeShowLogoChange = (value: boolean) => {
    updateProfile({ memeShowLogo: value });
  }

  const handleMemeLogoScaleChange = (value: number[]) => {
    updateProfile({ memeLogoScale: value[0] });
  }

  if (!isLoaded) {
      return <ProfileSkeleton />;
  }

  return (
    <main className="overflow-y-auto">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="text-center mb-8">
            <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">Meu Perfil</h1>
            <p className="text-muted-foreground mt-2 text-lg">Personalize suas informações e aparência de marca.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Coluna de Edição */}
          <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Edit2 /> Editar Informações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="username" className="flex items-center gap-2 text-primary"><User />Nome de Usuário</Label>
                        <Input
                            id="username"
                            value={profile.username}
                            onChange={(e) => handleProfileChange('username', e.target.value)}
                            placeholder="Seu nome..."
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="social" className="flex items-center gap-2 text-primary"><LinkIcon />Rede Social</Label>
                        <Input
                            id="social"
                            value={profile.social}
                            onChange={(e) => handleProfileChange('social', e.target.value)}
                            placeholder="@seuusuario..."
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-primary"><Upload />Foto de Perfil</Label>
                        <input
                            type="file"
                            ref={photoFileInputRef}
                            onChange={(e) => handleFileUpload(e, 'photo')}
                            className="hidden"
                            accept="image/*"
                        />
                        <Button onClick={() => photoFileInputRef.current?.click()} variant="outline" className="w-full">
                            Carregar Nova Foto
                        </Button>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-primary"><ImageUp />Logomarca 1</Label>
                        <input
                            type="file"
                            ref={logo1FileInputRef}
                            onChange={(e) => handleFileUpload(e, 'logo')}
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
                                onChange={(e) => handleProfileChange('logo', e.target.value)}
                                placeholder="Ou cole o link da imagem aqui"
                            />
                        </div>
                    </div>
                    
                    <Separator />

                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-primary"><ImageUp />Logomarca 2</Label>
                        <input
                            type="file"
                            ref={logo2FileInputRef}
                            onChange={(e) => handleFileUpload(e, 'logo2')}
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
                                onChange={(e) => handleProfileChange('logo2', e.target.value)}
                                placeholder="Ou cole o link da imagem aqui"
                            />
                        </div>
                    </div>
                     <p className="text-xs text-muted-foreground text-center pt-1">
                        Use imagens com fundo transparente (PNG) para melhores resultados.
                    </p>
                </CardContent>
            </Card>

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
                          onValueChange={handleMemeFontSizeChange}
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
                          onCheckedChange={handleMemeShowLogoChange}
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
                            onValueChange={handleMemeLogoScaleChange}
                        />
                    </div>
                  )}

              </CardContent>
            </Card>
          </div>
          
          {/* Coluna de Pré-visualização */}
          <div className="space-y-8">
              <h3 className="text-xl font-headline mb-4 text-center">Pré-visualizações</h3>
              <Card className="max-w-sm mx-auto overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300">
                  <div className="grid grid-cols-2 bg-muted h-24 relative items-center justify-center">
                    <div className="flex items-center justify-center h-full">
                        {profile.logo && (
                            <img src={profile.logo} alt="Pré-visualização da logomarca 1" className="max-h-full max-w-full p-2" />
                        )}
                    </div>
                     <div className="flex items-center justify-center h-full border-l">
                        {profile.logo2 && (
                            <img src={profile.logo2} alt="Pré-visualização da logomarca 2" className="max-h-full max-w-full p-2" />
                        )}
                    </div>
                  </div>
                  <CardContent className="relative text-center -mt-14 pt-0">
                      <Avatar className="w-24 h-24 mx-auto border-4 border-card shadow-lg">
                          <AvatarImage src={profile.photo || ''} alt={profile.username} />
                          <AvatarFallback><User /></AvatarFallback>
                      </Avatar>
                      <h2 className="text-2xl font-bold mt-4 font-headline">{profile.username}</h2>
                      <p className="text-muted-foreground">{profile.social}</p>

                      <div className="mt-6 border-t pt-4">
                          <Card className="text-left">
                              <CardHeader className="p-4">
                                  <div className="flex items-start gap-3">
                                      <Avatar>
                                          <AvatarImage src={profile.photo || ''} alt={profile.username} />
                                          <AvatarFallback><User /></AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1">
                                          <div className="flex items-center justify-between">
                                              <div>
                                                  <p className="font-bold">{profile.username}</p>
                                                  <p className="text-sm text-muted-foreground">{profile.social}</p>
                                              </div>
                                              <div className="flex items-center">
                                                {profile.showIcon && <Twitter className="h-5 w-5 text-[#1DA1F2]" />}
                                                <Button variant="ghost" size="icon" onClick={() => handleProfileChange('showIcon', !profile.showIcon)}>
                                                    {profile.showIcon ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                                                </Button>
                                              </div>
                                          </div>
                                      </div>
                                  </div>
                                  <p className="mt-3 text-base">"A única maneira de fazer um ótimo trabalho é amar o que você faz."</p>
                              </CardHeader>
                               <CardFooter className="p-4 pt-0 flex justify-between items-center text-xs text-muted-foreground">
                                    {profile.showDate ? (
                                          <p>10:30 AM · 28 de Maio de 2024</p>
                                    ) : <div />}
                                    <Button variant="ghost" size="icon" onClick={() => handleProfileChange('showDate', !profile.showDate)}>
                                        <Calendar className="h-5 w-5" />
                                    </Button>
                               </CardFooter>
                          </Card>
                      </div>
                  </CardContent>
              </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
