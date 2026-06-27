
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from "next/link";
import { useFavorites } from "@/hooks/use-favorites";
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Film, Copy, Trash2, Share2, HeartCrack, MoreVertical, Edit, Download, Loader2, MessageSquare, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Skeleton } from '@/components/ui/skeleton';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { Clipboard } from '@capacitor/clipboard';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// import { toJpeg } from 'html-to-image';
import { ensureAppStoragePermission, saveFileToAppFolder } from '@/lib/file-storage';
import { ClientOnly } from '@/components/client-only';
import { useProfile } from '@/hooks/use-profile';
import { ModeloTwitter } from '@/app/editor-de-video/modelos/modelo-twitter';
import type { EditorState, EstiloTexto } from '@/app/editor-de-video/tipos';


interface QuoteWithAuthor {
    id: string;
    quote: string;
    author?: string;
    category?: string;
    subCategory?: string;
    sheetName: string;
}

interface FavoritesClientPageProps {
  allQuotes: QuoteWithAuthor[];
}

function generateFilename(quote: QuoteWithAuthor, format: 'png' | 'jpeg' | 'jpg'): string {
    const safeCategory = quote.category?.replace(/\s+/g, '-') || 'Geral';
    const safeSubCategory = quote.subCategory?.replace(/\s+/g, '-');
    
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const timestamp = `${year}${month}${day}_${hours}${minutes}${seconds}`;

    const parts = ['InspiraMe', safeCategory];
    if (safeSubCategory && safeSubCategory !== 'Todos') {
        parts.push(safeSubCategory);
    }
    parts.push(timestamp);
    
    return `${parts.join('_')}.${format}`;
}

function MemeGenerator({ quote, profile, editorState, onClose, shareDirectly = false }: {
  quote: QuoteWithAuthor;
  profile: ReturnType<typeof useProfile>['profile'];
  editorState: EditorState;
  onClose: () => void;
  shareDirectly?: boolean;
}) {
  const memeRef = useRef<HTMLDivElement>(null);
  const [memeUrl, setMemeUrl] = useState<string | null>(null);
  const [memeFile, setMemeFile] = useState<File | null>(null);
  const [isCopyingImage, setIsCopyingImage] = useState(false);
  const [isSharingImage, setIsSharingImage] = useState(false);
  const { toast } = useToast();

  const baseTextStyle: EstiloTexto = {
      fontFamily: editorState.fontFamily,
      fontSize: `${editorState.fontSize}cqw`,
      fontWeight: editorState.fontWeight,
      fontStyle: editorState.fontStyle,
      color: editorState.textColor,
      textAlign: editorState.textAlign,
      lineHeight: editorState.lineHeight,
  };

  useEffect(() => {
    const generateAndProcess = async () => {
      if (!memeRef.current) return;
      
      try {
        await document.fonts.ready;
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const { toJpeg } = await import('html-to-image');
        const dataUrl = await toJpeg(memeRef.current, {
            quality: 0.95,
            pixelRatio: 2,
            backgroundColor: '#000000'
        });
        if (!dataUrl) {
            throw new Error("Falha ao gerar a imagem em formato JPEG.");
        }
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        if (!blob) {
            throw new Error("Falha ao processar o blob da imagem.");
        }
        
        const filename = generateFilename(quote, 'jpg');
        const fileObj = new File([blob], filename, { type: 'image/jpeg' });
        setMemeFile(fileObj);
        setMemeUrl(URL.createObjectURL(blob));

        if (shareDirectly) {
            if (Capacitor.isNativePlatform()) {
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = async () => {
                    const base64Data = reader.result?.toString().split('base64,')[1];
                    if (!base64Data) {
                         throw new Error("Não foi possível extrair os dados da imagem.");
                    }

                    const permissionGranted = await ensureAppStoragePermission();
                    if (!permissionGranted) {
                        throw new Error('Permissão de armazenamento não concedida.');
                    }
                    
                    const { uri } = await saveFileToAppFolder(base64Data, filename, quote.category);
                    if (!uri) throw new Error("Não foi possível salvar o arquivo na pasta do app.");
                    await Share.share({ url: uri });
                    onClose();
                }
            }
        }
      } catch (error) {
        console.error('Erro ao gerar/compartilhar meme:', error);
        if (error instanceof DOMException && error.name === 'AbortError') {
            console.log("Compartilhamento cancelado pelo usuário.");
        } else {
            toast({ variant: 'destructive', title: 'Erro', description: `Não foi possível ${shareDirectly ? 'compartilhar' : 'gerar'} o meme. ${error instanceof Error ? error.message : ''}` });
        }
        onClose();
      }
    };

    generateAndProcess();

    return () => {
        if (memeUrl) {
            URL.revokeObjectURL(memeUrl);
        }
    }
  }, [shareDirectly, quote, toast, onClose]);

  const handleCopyImageClick = async () => {
    if (!memeUrl) return;
    setIsCopyingImage(true);
    try {
      const response = await fetch(memeUrl);
      const blob = await response.blob();
      
      if (navigator.clipboard && window.isSecureContext) {
        // Converte o jpeg/blob para png para maximizar compatibilidade com a área de transferência do sistema
        const pngBlob = await new Promise<Blob>((resolve, reject) => {
            const img = new window.Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error("Erro ao criar contexto de canvas"));
                    return;
                }
                ctx.drawImage(img, 0, 0);
                canvas.toBlob((result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(new Error("Falha ao exportar PNG"));
                    }
                }, 'image/png');
            };
            img.onerror = () => reject(new Error("Erro ao carregar imagem para conversão"));
            img.src = URL.createObjectURL(blob);
        });

        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': pngBlob
          })
        ]);
        
        toast({ 
          title: 'Imagem Copiada!', 
          description: 'A imagem foi copiada para a sua área de transferência com sucesso.' 
        });
        onClose();
      } else {
        throw new Error("API de Área de Transferência não disponível ou contexto não seguro.");
      }
    } catch (err) {
      console.error("Erro ao copiar imagem:", err);
      toast({ 
        variant: 'destructive', 
        title: 'Erro ao copiar imagem', 
        description: 'Não foi possível copiar. Por favor, utilize a opção de Baixar.' 
      });
    } finally {
      setIsCopyingImage(false);
    }
  };

  const handleShareImageClick = async () => {
    if (!memeFile) return;
    setIsSharingImage(true);
    try {
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [memeFile] })) {
        await navigator.share({
          files: [memeFile],
        });
        onClose();
      } else {
        toast({
          title: "Compartilhamento não suportado",
          description: "Seu navegador não suporta compartilhamento de arquivos. Por favor, utilize a opção de Baixar ou Copiar.",
        });
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        console.log("Compartilhamento cancelado pelo usuário.");
      } else {
        console.error("Erro ao compartilhar imagem:", err);
        toast({
          variant: 'destructive',
          title: 'Erro ao compartilhar',
          description: 'Não foi possível compartilhar a imagem. Tente baixar ou copiar.',
        });
      }
    } finally {
      setIsSharingImage(false);
    }
  };

  const handleDownloadClick = async () => {
    if (!memeUrl) return;

    const filename = generateFilename(quote, 'jpg');

    if (Capacitor.isNativePlatform()) {
      try {
        const response = await fetch(memeUrl);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          const base64Data = reader.result?.toString().split('base64,')[1];
          if (base64Data) {
            try {
              const { uri } = await saveFileToAppFolder(base64Data, filename, quote.category);
              toast({ title: 'Sucesso!', description: `Meme salvo na pasta Download/InspiraMe/${quote.category || ''}` });
            } catch (fallbackError) {
              console.error(fallbackError);
              toast({ variant: 'destructive', title: 'Erro ao salvar', description: 'Não foi possível salvar a imagem.' });
            }
          }
          onClose();
        };
      } catch (err) {
        console.error("Erro ao converter blob nativamente:", err);
        toast({ variant: 'destructive', title: 'Erro de download', description: 'Ocorreu um erro ao baixar a imagem.' });
        onClose();
      }
      return;
    }

    const link = document.createElement('a');
    link.href = memeUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({ title: 'Sucesso!', description: `Seu meme foi baixado como ${filename}.` });
    onClose();
  };

  if (shareDirectly && !memeUrl) {
      return (
          <>
            <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
              <div className="text-white text-center flex flex-col items-center gap-4">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <p className="text-lg font-bold">Preparando imagem...</p>
              </div>
            </div>
            <div className="fixed top-[-9999px] left-[-9999px]">
                <div 
                    ref={memeRef} 
                    className="relative overflow-hidden flex flex-col justify-center bg-black"
                    style={{ width: '500px', aspectRatio: '9 / 16', backgroundColor: '#000000' }}
                >
                    <ModeloTwitter
                        editorState={editorState}
                        profile={profile}
                        baseTextStyle={baseTextStyle}
                        textEffectsStyle={{}}
                        dropShadowStyle={{}}
                    />
                </div>
            </div>
          </>
      );
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4" onClick={onClose}>
        <div className="relative w-full max-w-sm sm:max-w-md mx-auto" onClick={(e) => e.stopPropagation()}>
            {memeUrl ? (
                 <div className="flex flex-col items-center gap-4 bg-[#020817]/95 border border-slate-800 p-6 rounded-2xl">
                    <p className="text-white text-md font-semibold text-center leading-tight">Visualizar Imagem</p>
                    <img 
                        src={memeUrl} 
                        alt="Pré-visualização do Meme" 
                        className="max-w-[75vw] max-h-[55vh] rounded-lg shadow-2xl cursor-pointer border border-[#1e293b]"
                        style={{ aspectRatio: '9 / 16' }}
                        onClick={handleDownloadClick}
                    />
                    <div className="flex flex-col gap-2 w-full mt-2">
                        {memeFile && typeof window !== 'undefined' && navigator.share && (
                          <Button
                              variant="default"
                              disabled={isCopyingImage || isSharingImage}
                              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer"
                              onClick={handleShareImageClick}
                          >
                              {isSharingImage ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                  <Share2 className="h-4 w-4" />
                              )}
                              Compartilhar Imagem
                          </Button>
                        )}
                        <div className="grid grid-cols-2 gap-3 w-full">
                            <Button
                                variant="outline"
                                disabled={isCopyingImage || isSharingImage}
                                className="bg-[#1e293b] hover:bg-slate-800 text-slate-100 border-none font-semibold py-2 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer"
                                onClick={handleDownloadClick}
                            >
                                <Download className="h-4 w-4" />
                                Baixar
                            </Button>
                            <Button
                                variant="secondary"
                                disabled={isCopyingImage || isSharingImage}
                                className="bg-[#1e293b] hover:bg-slate-800 text-slate-100 font-semibold py-2 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer"
                                onClick={handleCopyImageClick}
                            >
                                {isCopyingImage ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                                Copiar Imagem
                            </Button>
                        </div>
                    </div>
                 </div>
            ) : (
                <div className="text-white text-center flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p className="text-lg font-bold">Gerando seu meme...</p>
                </div>
            )}
            <div className="fixed top-[-9999px] left-[-9999px]">
                <div 
                    ref={memeRef} 
                    className="relative overflow-hidden flex flex-col justify-center bg-black"
                    style={{ width: '500px', aspectRatio: '9 / 16', backgroundColor: '#000000' }}
                >
                    <ModeloTwitter
                        editorState={editorState}
                        profile={profile}
                        baseTextStyle={baseTextStyle}
                        textEffectsStyle={{}}
                        dropShadowStyle={{}}
                    />
                </div>
            </div>
        </div>
    </div>
  );
}

export function FavoritesClientPage({ allQuotes }: FavoritesClientPageProps) {
  const { favorites, toggleFavorite } = useFavorites();
  const { toast } = useToast();
  const router = useRouter();
  const { profile } = useProfile();
  
  const [favoriteQuotes, setFavoriteQuotes] = useState<QuoteWithAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quoteForMeme, setQuoteForMeme] = useState<{ quote: QuoteWithAuthor; action: 'preview' | 'share'; } | null>(null);

  useEffect(() => {
    setIsLoading(true);
    if (allQuotes) {
      const userFavorites = allQuotes.filter(quote => favorites.includes(quote.id));
      setFavoriteQuotes(userFavorites);
    }
    setIsLoading(false);
  }, [favorites, allQuotes]);

  const handleCopy = async (text: string, author?: string) => {
    const textToCopy = author ? `"${text}" - ${author}` : text;
    try {
        if (Capacitor.isNativePlatform()) {
            await Clipboard.write({ string: textToCopy });
            toast({ title: 'Copiado!', description: 'A frase foi copiada para a sua área de transferência.' });
            return;
        }

        let copied = false;
        if (navigator.clipboard && window.isSecureContext) {
            try {
                await navigator.clipboard.writeText(textToCopy);
                toast({ title: 'Copiado!', description: 'A frase foi copiada para a sua área de transferência.' });
                copied = true;
            } catch (clipErr) {
                console.warn('navigator.clipboard.writeText failed, playing back fallback:', clipErr);
            }
        }

        if (!copied) {
            const textArea = document.createElement('textarea');
            textArea.value = textToCopy;
            textArea.style.position = 'fixed';
            textArea.style.left = '-9999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                toast({ title: 'Copiado!', description: 'A frase foi copiada para a sua área de transferência.' });
            } catch (err) {
                console.error('Falha ao usar execCommand:', err);
                toast({ title: 'Erro ao Copiar', description: 'Não foi possível copiar.', variant: 'destructive' });
            }
            document.body.removeChild(textArea);
        }
    } catch (err) {
        console.error('Falha ao copiar:', err);
        toast({ title: 'Erro ao Copiar', description: 'Não foi possível copiar a frase.', variant: 'destructive' });
    }
  };

  const handleShare = async (text: string, author?: string) => {
    const shareText = author ? `"${text}" - ${author}` : text;
    
    if (Capacitor.isNativePlatform()) {
        try {
            await Share.share({
                title: 'InspireMe',
                text: shareText,
                dialogTitle: 'Compartilhar Frase'
            });
        } catch (error) {
            console.error("Erro ao usar Capacitor Share API, usando fallback de cópia:", error);
            await handleCopy(text, author);
        }
        return;
    }

    if (navigator.share) {
      try {
        await navigator.share({ title: 'InspireMe', text: shareText });
      } catch (error) {
        if (error instanceof DOMException && (error.name === 'AbortError' || error.name === 'NotAllowedError')) {
           await handleCopy(text, author);
        } else {
          console.error("Erro ao compartilhar, usando fallback de cópia:", error);
          await handleCopy(text, author);
        }
      }
    } else {
      await handleCopy(text, author);
    }
  };

  const handleShareMeme = (quote: QuoteWithAuthor) => {
    setQuoteForMeme({ quote, action: 'share' });
  };

  const handlePreviewMeme = (quote: QuoteWithAuthor) => {
    setQuoteForMeme({ quote, action: 'preview' });
  };
  
    const handleGoToEditor = (quote: QuoteWithAuthor) => {
    const params = new URLSearchParams();
    params.set('quote', encodeURIComponent(quote.quote));
    if (quote.category) {
      params.set('category', quote.category);
    }
    if (quote.subCategory) {
      params.set('subCategory', quote.subCategory);
    }
    router.push(`/editor-de-video?${params.toString()}`);
  }
  
  const getMemeEditorState = (quote: QuoteWithAuthor): EditorState => {
    return {
        text: quote.quote,
        category: quote.category,
        subCategory: quote.subCategory,
        fontFamily: "Poppins",
        fontSize: profile.memeFontSize,
        fontWeight: "bold",
        fontStyle: "normal",
        textColor: "#FFFFFF",
        textAlign: "left",
        textShadowBlur: 0,
        textShadowOpacity: 0,
        textVerticalPosition: 50,
        textStrokeColor: "#000000",
        textStrokeWidth: 0,
        textStrokeCornerStyle: 'rounded',
        applyEffectsToEmojis: true,
        applyTextColorToSignature: false,
        letterSpacing: 0,
        lineHeight: 1.4,
        wordSpacing: 0,
        backgroundStyle: { type: 'solid', value: '#000000' },
        filmColor: "#000000",
        filmOpacity: 0,
        aspectRatio: '9 / 16',
        activeTemplateId: 'template-twitter',
        showProfileSignature: false,
        showLogo: profile.memeShowLogo,
        logoPositionX: 50,
        logoPositionY: 95,
        logoScale: profile.memeLogoScale,
        logoOpacity: 80,
        signaturePositionX: 50,
        signaturePositionY: 95,
        signatureScale: 60,
        showSignaturePhoto: false,
        showSignatureUsername: false,
        showSignatureSocial: false,
        showSignatureBackground: false,
        signatureBgColor: '#000000',
        signatureBgOpacity: 50,
        profileVerticalPosition: 50,
    };
  };

  const memeEditorState = quoteForMeme ? getMemeEditorState(quoteForMeme.quote) : null;

  const getCardClasses = () => {
      return cn(
          'group flex flex-col justify-between transition-shadow duration-300 border border-[var(--theme-card-border-color)]',
          'lg:[&:nth-child(3n+1)]:bg-[var(--theme-card-alt1-color)]/95',
          'lg:[&:nth-child(3n+2)]:bg-[var(--theme-card-alt2-color)]/95',
          'lg:[&:nth-child(3n+3)]:bg-[var(--theme-card-alt3-color)]/95',
          'max-lg:[&:nth-child(4n+1)]:bg-[var(--theme-card-alt1-color)]/95',
          'max-lg:[&:nth-child(4n+2)]:bg-[var(--theme-card-alt2-color)]/95',
          'max-lg:[&:nth-child(4n+3)]:bg-[var(--theme-card-alt3-color)]/95',
          'max-lg:[&:nth-child(4n+4)]:bg-[var(--theme-card-alt4-color)]/95'
      );
  };

  const renderSkeletons = () => (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className={getCardClasses()}>
                <CardContent className="p-4 pb-0">
                    <Skeleton className="h-16 w-full" />
                </CardContent>
                <CardFooter className="p-4 pt-2 flex flex-col items-end gap-2">
                    <Skeleton className="h-4 w-1/3" />
                </CardFooter>
            </Card>
        ))}
    </div>
  );

  const handleCardSubCategoryClick = (subCategory: string) => {
    router.push(`/frases?subCategory=${encodeURIComponent(subCategory)}&mainCategory=Todos`);
  };

  return (
    <>
      <main className="overflow-y-auto">
          <div className="container mx-auto py-8 px-4">
              <div className="text-center mb-8">
                  <h1 className="font-headline text-4xl md:text-5xl font-bold text-[var(--theme-title-color)]">Meus Favoritos</h1>
                  <p className="text-muted-foreground mt-2 text-lg text-[var(--theme-subtitle-color)]">Suas frases mais queridas, salvas em um só lugar.</p>
              </div>
              {isLoading ? renderSkeletons() : favoriteQuotes.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {favoriteQuotes.map((quote) => {
                      const isFavorited = favorites.includes(quote.id);
                      return (
                          <Card key={quote.id} className={getCardClasses()}>
                              <CardContent className="p-4 pb-0 flex-1">
                                  <p className="text-sm font-body text-[var(--theme-card-text-color)]">{quote.quote}</p>
                              </CardContent>
                              <CardFooter className="px-4 pt-2 pb-2 flex flex-col items-stretch gap-2">
                                  <div className="flex justify-between items-center w-full text-[10px]">
                                      {quote.subCategory && quote.subCategory !== 'Todos' ? (
                                          <Button 
                                              variant="link" 
                                              className="p-0 h-auto text-primary text-[10px] bg-primary/10 px-2 py-0.5 rounded-full truncate max-w-[120px] hover:no-underline hover:bg-primary/20"
                                              onClick={() => handleCardSubCategoryClick(quote.subCategory!)}
                                          >
                                              {quote.subCategory}
                                          </Button>
                                      ) : <div />}
                                      {quote.author && (
                                          <p className="font-medium text-[var(--theme-secondary-text-color)] truncate">
                                              - {quote.author}
                                          </p>
                                      )}
                                  </div>
                                  <div className="flex justify-end items-center w-full border-t border-muted/20 pt-1.5 mt-1.5 -space-x-2 -mr-2">
                                    <Button variant="ghost" size="icon-sm" onClick={() => handlePreviewMeme(quote)}>
                                        <Download className="h-4 w-4 text-[var(--theme-interface-icon-color)]" />
                                    </Button>
                                    <Button variant="ghost" size="icon-sm" onClick={() => handleCopy(quote.quote, quote.author)}>
                                      <Copy className="h-4 w-4 text-[var(--theme-interface-icon-color)]" />
                                    </Button>
                                    <Button variant="ghost" size="icon-sm" onClick={() => toggleFavorite(quote.id)}>
                                      <Star className={cn("h-4 w-4", isFavorited ? "text-[var(--theme-favorite-color)] fill-current" : "text-[var(--theme-interface-icon-color)]")} />
                                    </Button>
                                    <Button variant="ghost" size="icon-sm" onClick={() => handleShareMeme(quote)}>
                                      <Share2 className="h-4 w-4 text-[var(--theme-interface-icon-color)]" />
                                    </Button>
                                     <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon-sm">
                                                <MoreVertical className="h-4 w-4 text-[var(--theme-interface-icon-color)]" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem onClick={() => handleGoToEditor(quote)}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edição Avançada
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleShare(quote.quote, quote.author)}>
                                              <MessageSquare className="mr-2 h-4 w-4" />
                                                Compartilhar Texto
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                              </CardFooter>
                          </Card>
                      );
                  })}
              </div>
              ) : (
              <div className="text-center py-20 bg-card border rounded-lg flex flex-col items-center">
                  <Star className="h-16 w-16 text-muted-foreground/30 mb-4" />
                  <h2 className="text-2xl font-semibold mb-2">Nenhuma frase favorita ainda</h2>
                  <p className="text-muted-foreground mb-6">
                  Clique no ícone de estrela (⭐) em uma frase para adicioná-la aqui.
                  </p>
                  <Link href="/frases" passHref>
                  <Button>Encontrar Inspiração</Button>
                  </Link>
              </div>
              )}
          </div>
      </main>
      
      <ClientOnly>
        {quoteForMeme && memeEditorState && (
          <MemeGenerator
            quote={quoteForMeme.quote}
            profile={profile}
            editorState={memeEditorState}
            onClose={() => setQuoteForMeme(null)}
            shareDirectly={quoteForMeme.action === 'share'}
          />
        )}
      </ClientOnly>
    </>
  );
}
