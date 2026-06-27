
"use client";

import React, { useState, useRef } from 'react';
// removed html2canvas
import { useProfile } from '@/hooks/use-profile';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Download, User, AtSign, Image as ImageIcon, Loader2, Twitter } from 'lucide-react';
import { AssinaturaPerfil } from '../editor-de-video/modelos/assinatura-perfil';
import { Skeleton } from '@/components/ui/skeleton';

export const dynamic = 'force-dynamic';

// Componente de pré-visualização da assinatura
function AssinaturaPreview({ profile, showPhoto, showUsername, showSocial }: {
  profile: ReturnType<typeof useProfile>['profile'];
  showPhoto: boolean;
  showUsername: boolean;
  showSocial: boolean;
}) {
  return (
    <div id="signature-export-preview" className="bg-gray-800 p-4 flex items-center justify-center rounded-lg">
      <AssinaturaPerfil 
        profile={profile}
        showPhoto={showPhoto}
        showUsername={showUsername}
        showSocial={showSocial}
        showBackground={false} // Fundo transparente para a pré-visualização
        bgColor=""
        bgOpacity={0}
      />
    </div>
  );
}

// Página principal do módulo de Assinatura
export default function AssinaturaPage() {
  const { profile, isLoaded } = useProfile();
  const { toast } = useToast();
  
  const [showPhoto, setShowPhoto] = useState(true);
  const [showUsername, setShowUsername] = useState(true);
  const [showSocial, setShowSocial] = useState(true);
  const [showIcon, setShowIcon] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    const element = document.getElementById('signature-export-preview');
    if (!element) {
      toast({
        variant: "destructive",
        title: "Erro na Exportação",
        description: "Não foi possível encontrar a área de pré-visualização."
      });
      return;
    }
  
    setIsExporting(true);
    try {
      // espera fontes carregarem (melhora render)
      if (document.fonts && document.fonts.ready) await document.fonts.ready;
  
      // pega referências internas (ajuste os seletores caso seu markup seja diferente)
      const avatarEl = element.querySelector('img') as HTMLImageElement | null; // avatar do AvatarImage ou <img>
      const usernameEl = element.querySelector('p.font-bold') as HTMLElement | null;
      const socialEl = element.querySelector('p.text-gray-300') as HTMLElement | null;
  
      // fallback de valores caso não encontre os elementos
      const username = (usernameEl && usernameEl.textContent) || (profile.username || '');
      const social = (socialEl && socialEl.textContent) || (profile.social || '');
  
      // computed styles
      const usernameStyle = usernameEl ? getComputedStyle(usernameEl) : { fontSize: '14px', fontFamily: 'Arial', color: '#ffffff' } as any;
      const socialStyle = socialEl ? getComputedStyle(socialEl) : { fontSize: '12px', fontFamily: 'Arial', color: '#cbd5e1' } as any;
  
      // dimensões baseadas no elemento da pré-visualização
      const rect = element.getBoundingClientRect();
      const padding = 12; // você pode ajustar
      const avatarSize = avatarEl ? Math.round((avatarEl.clientHeight || 40)) : 40;
      const gap = 12; // espaço entre avatar e bloco de texto
  
      const svgWidth = Math.max(rect.width, avatarSize + padding * 2 + 200);
      const svgHeight = Math.max(rect.height, avatarSize + padding * 2);
  
      // converte imagem para dataURL (tenta)
      const loadImageAsDataURL = (src?: string | null) =>
        new Promise<string | null>((resolve) => {
          if (!src) return resolve(null);
          const img = new Image();
          img.crossOrigin = 'Anonymous'; // tenta CORS
          img.onload = () => {
            try {
              const c = document.createElement('canvas');
              c.width = img.naturalWidth;
              c.height = img.naturalHeight;
              const ctx = c.getContext('2d');
              if (!ctx) return resolve(null);
              ctx.drawImage(img, 0, 0);
              const dataUrl = c.toDataURL('image/png');
              resolve(dataUrl);
            } catch (e) {
              console.warn('Não foi possível converter a imagem para dataURL (CORS?):', e);
              resolve(null);
            }
          };
          img.onerror = () => resolve(null);
          img.src = src;
          // timeout fallback
          setTimeout(() => resolve(null), 3000);
        });
  
      const avatarSrc = avatarEl?.src || profile.photo || null;
      const avatarDataUrl = await loadImageAsDataURL(avatarSrc);
  
      // decide posições
      const avatarX = padding;
      const avatarY = (svgHeight - avatarSize) / 2;
  
      const textBlockX = avatarX + avatarSize + gap;
      // vamos usar font-size em px extraídos do computedStyle (ex.: "14px")
      const usernameFontSize = parseFloat(usernameStyle.fontSize || '14');
      const socialFontSize = parseFloat(socialStyle.fontSize || '12');
  
      // alinhamento vertical: calculamos o baseline do centro do bloco
      // colocar o username um pouco acima do centro e a rede social abaixo
      const centerY = svgHeight / 2;
      const usernameY = centerY - (socialFontSize / 2) + 1; // ajuste fino +1px
      const socialY = centerY + (usernameFontSize / 2) + 1; // ajuste fino +1px
  
      // escapando texto para XML
      const esc = (s: string) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  
      // icon: use SVG inline (Twitter) ou imagem embutida se tiver iconUrl
      const twitterSvg = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="${socialFontSize}" height="${socialFontSize}" role="img"><path fill="#1DA1F2" d="M22.46 6c-.77.35-1.6.59-2.46.7a4.27 4.27 0 0 0 1.87-2.36 8.47 8.47 0 0 1-2.7 1.03 4.24 4.24 0 0 0-7.23 3.87A12.03 12.03 0 0 1 3.15 4.6a4.24 4.24 0 0 0 1.31 5.66c-.64-.02-1.24-.2-1.76-.48v.05c0 2.04 1.45 3.74 3.37 4.12a4.27 4.27 0 0 1-1.75.07 4.26 4.26 0 0 0 3.97 2.96A8.52 8.52 0 0 1 2 19.54a12.03 12.03 0 0 0 6.5 1.9c7.8 0 12.08-6.46 12.08-12.07v-.55A8.6 8.6 0 0 0 22.46 6z"/></svg>`;
      
      const iconGroup = showIcon ? `
        <g transform="translate(${svgWidth - padding - socialFontSize}, ${centerY - socialFontSize/2})">
            ${twitterSvg}
        </g>
      ` : '';

      // cria o XML do SVG
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">
          <style>
            /* fonts inline: tenta usar a família informada, fallback para sans-serif */
            .username { font-family: ${usernameStyle.fontFamily || 'sans-serif'}; font-size: ${usernameFontSize}px; font-weight: ${usernameStyle.fontWeight || '700'}; fill: ${usernameStyle.color || '#fff'}; dominant-baseline: middle; }
            .social { font-family: ${socialStyle.fontFamily || 'sans-serif'}; font-size: ${socialFontSize}px; font-weight: ${socialStyle.fontWeight || '400'}; fill: ${socialStyle.color || '#cbd5e1'}; dominant-baseline: middle; }
          </style>
  
          ${avatarDataUrl ? `<image href="${avatarDataUrl}" x="${avatarX}" y="${avatarY}" width="${avatarSize}" height="${avatarSize}" preserveAspectRatio="xMidYMid slice" />` : `
            <rect x="${avatarX}" y="${avatarY}" width="${avatarSize}" height="${avatarSize}" rx="${avatarSize/6}" fill="#374151" />
          `}
  
          <!-- nome e rede -->
          <text x="${textBlockX}" y="${usernameY}" class="username">${esc(username)}</text>
          <text x="${textBlockX}" y="${socialY}" class="social">${esc(social)}</text>
  
          <!-- ícone à direita (opcional) -->
          ${iconGroup}
        </svg>
      `;
  
      // converte SVG para PNG via canvas (assim baixa PNG)
      const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const svgImg = new Image();
      svgImg.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = svgWidth * 2; // melhor resolução
          canvas.height = svgHeight * 2;
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('Canvas context not disponível');
          // fundo transparente
          ctx.drawImage(svgImg, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.download = 'minha-assinatura.png';
          link.href = dataUrl;
          link.click();
          URL.revokeObjectURL(url);
          toast({
            title: "Assinatura Exportada!",
            description: "Sua assinatura foi salva como PNG via SVG."
          });
        } catch (err) {
          console.error('Erro ao converter SVG para PNG:', err);
          toast({ variant: 'destructive', title: 'Erro', description: 'Falha ao gerar PNG a partir do SVG.'});
        } finally {
          setIsExporting(false);
        }
      };
      svgImg.onerror = (e) => {
        console.error('Erro ao carregar SVG como imagem:', e);
        URL.revokeObjectURL(url);
        setIsExporting(false);
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível renderizar o SVG.'});
      };
      svgImg.src = url;
  
      // se o fluxo seguir sem carregar (por segurança), depois de 6s limpa isExporting
      setTimeout(() => { if (isExporting) setIsExporting(false); }, 8000);
  
    } catch (error) {
      console.error("Erro ao exportar assinatura (SVG):", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um problema ao gerar a imagem da assinatura."
      });
      setIsExporting(false);
    }
  };

  if (!isLoaded) {
    return (
        <div className="container mx-auto py-8 px-4 max-w-2xl">
            <Skeleton className="h-10 w-64 mx-auto mb-2" />
            <Skeleton className="h-5 w-80 mx-auto mb-8" />
            <Skeleton className="h-64 w-full" />
        </div>
    )
  }

  return (
    <main className="overflow-y-auto">
        <div className="container mx-auto py-8 px-4 max-w-2xl">
            <div className="text-center mb-8">
                <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">Gerador de Assinatura</h1>
                <p className="text-muted-foreground mt-2 text-lg">Crie uma assinatura personalizada para usar em seus vídeos.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Pré-visualização */}
                <div className="flex flex-col items-center justify-center">
                    <h3 className="text-lg font-semibold mb-4">Pré-visualização</h3>
                    <AssinaturaPreview 
                        profile={profile}
                        showPhoto={showPhoto}
                        showUsername={showUsername}
                        showSocial={showSocial}
                    />
                </div>

                {/* Controles */}
                <Card>
                    <CardHeader>
                        <CardTitle>Opções de Visualização</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg border">
                            <Label htmlFor="show-photo" className="flex items-center gap-2 cursor-pointer">
                                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                Mostrar Avatar
                            </Label>
                            <Switch
                                id="show-photo"
                                checked={showPhoto}
                                onCheckedChange={setShowPhoto}
                            />
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg border">
                            <Label htmlFor="show-username" className="flex items-center gap-2 cursor-pointer">
                                <User className="h-5 w-5 text-muted-foreground" />
                                Mostrar Nome
                            </Label>
                            <Switch
                                id="show-username"
                                checked={showUsername}
                                onCheckedChange={setShowUsername}
                            />
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg border">
                            <Label htmlFor="show-social" className="flex items-center gap-2 cursor-pointer">
                                <AtSign className="h-5 w-5 text-muted-foreground" />
                                Mostrar Rede Social
                            </Label>
                            <Switch
                                id="show-social"
                                checked={showSocial}
                                onCheckedChange={setShowSocial}
                            />
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg border">
                            <Label htmlFor="show-icon" className="flex items-center gap-2 cursor-pointer">
                                <Twitter className="h-5 w-5 text-muted-foreground" />
                                Mostrar Ícone (na exportação)
                            </Label>
                            <Switch
                                id="show-icon"
                                checked={showIcon}
                                onCheckedChange={setShowIcon}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="text-center mt-10">
                <Button size="lg" onClick={handleExport} disabled={isExporting}>
                    {isExporting ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                        <Download className="mr-2 h-5 w-5" />
                    )}
                    {isExporting ? "Exportando..." : "Exportar como PNG"}
                </Button>
            </div>
        </div>
    </main>
  );
}
