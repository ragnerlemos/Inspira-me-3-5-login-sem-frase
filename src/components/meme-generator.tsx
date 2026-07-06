'use client';

import { useState, useEffect, useRef } from 'react';
import { Loader2, Share2, Download, Copy, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { ensureAppStoragePermission, saveFileToAppFolder } from '@/lib/file-storage';
import { useProfile } from '@/hooks/use-profile';
import { generateFilename } from '@/lib/utils';
import type { EditorState, EstiloTexto } from '@/app/editor-de-video/tipos';
import { MemePreview } from './meme-generator/meme-preview';
import { MemeActions } from './meme-generator/meme-actions';
import { MemeHiddenRenderer } from './meme-generator/meme-hidden-renderer';

export interface MemeQuote {
  id: string;
  quote: string;
  author?: string;
  category?: string;
  subCategory?: string;
  sheetName?: string;
}

interface MemeGeneratorProps {
  quote: MemeQuote;
  profile: ReturnType<typeof useProfile>['profile'];
  editorState: EditorState;
  onClose: () => void;
  shareDirectly?: boolean;
  onCopy?: (text: string, author?: string) => Promise<void>;
}

export function MemeGenerator({
  quote,
  profile,
  editorState,
  onClose,
  shareDirectly = false,
  onCopy
}: MemeGeneratorProps) {
  const memeRef = useRef<HTMLDivElement>(null);
  const [memeUrl, setMemeUrl] = useState<string | null>(null);
  const [memeFile, setMemeFile] = useState<File | null>(null);
  const [isTextSelected, setIsTextSelected] = useState(false);
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
    let active = true;
    const generateAndProcess = async () => {
      if (!memeRef.current) return;
      
      try {
        await document.fonts.ready;
        await new Promise(resolve => setTimeout(resolve, 300)); // Aguarda a renderização
        
        if (!active) return;

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
        
        if (!active) return;

        const filename = generateFilename(quote, 'jpg');
        const fileObj = new File([blob], filename, { type: 'image/jpeg' });
        setMemeFile(fileObj);
        setMemeUrl(URL.createObjectURL(blob));

        if (shareDirectly) {
            if (Capacitor.isNativePlatform()) {
                // Lógica para App Nativo
                const reader = new FileReader();
                reader.onloadend = async () => {
                    try {
                        const base64Data = reader.result?.toString().split('base64,')[1];
                        if (!base64Data) {
                            throw new Error("Não foi possível extrair os dados da imagem.");
                        }

                        const permissionGranted = await ensureAppStoragePermission();
                        if (!permissionGranted) {
                            throw new Error('Permissão de armazenamento não concedida.');
                        }
                        
                        const { uri } = await saveFileToAppFolder(base64Data, filename, quote.category, quote.subCategory);
                        if (!uri) throw new Error("Não foi possível salvar o arquivo na pasta do app.");
                        await Share.share({ url: uri });
                    } catch (error) {
                        console.error('Erro no compartilhamento nativo:', error);
                        toast({
                            variant: 'destructive',
                            title: 'Erro',
                            description: 'Não foi possível compartilhar a imagem pelo app.',
                        });
                    } finally {
                        onClose();
                    }
                };
                reader.onerror = () => {
                    toast({
                        variant: 'destructive',
                        title: 'Erro',
                        description: 'Falha ao preparar a imagem para compartilhamento.',
                    });
                    onClose();
                };
                reader.readAsDataURL(blob);
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
        active = false;
        if (memeUrl) {
            URL.revokeObjectURL(memeUrl);
        }
    }
  }, [shareDirectly, quote, toast, onClose]);

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
              const { uri } = await saveFileToAppFolder(base64Data, filename, quote.category, quote.subCategory);
              toast({ title: 'Sucesso!', description: `Arquivo salvo com sucesso em Downloads/InspireMe/${quote.category || 'Geral'}/${quote.subCategory || 'Geral'}.` });
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

  const isSharingSupported = !!(memeFile && typeof window !== 'undefined' && navigator.share);

  // Se for para compartilhar diretamente e não houver fallback para download, apenas exibe o loader
  if (shareDirectly && !memeUrl) {
      return (
          <>
            <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
              <div className="text-white text-center flex flex-col items-center gap-4">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <p className="text-lg font-bold">Preparando imagem...</p>
              </div>
            </div>
            <MemeHiddenRenderer 
                memeRef={memeRef}
                editorState={editorState}
                profile={profile}
                baseTextStyle={baseTextStyle}
                isTextSelected={isTextSelected}
                setIsTextSelected={setIsTextSelected}
            />
          </>
      );
  }

  // Renderiza a pré-visualização para download
  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4" onClick={onClose}>
        <div className="relative w-full max-w-sm sm:max-w-md mx-auto" onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" onClick={onClose} className="absolute right-3 top-3 z-50 text-white bg-transparent hover:bg-white/5" aria-label="Fechar">
              <X className="h-5 w-5" />
            </Button>
            <div className="flex flex-col items-center gap-4 bg-[#020817]/95 border border-slate-800 p-6 rounded-2xl">
                <MemePreview 
                    memeUrl={memeUrl} 
                    onDownload={handleDownloadClick} 
                />
                
                {memeUrl && (
                    <MemeActions 
                        isSharingSupported={isSharingSupported}
                        isCopyingImage={isCopyingImage}
                        isSharingImage={isSharingImage}
                        onShare={handleShareImageClick}
                        onDownload={handleDownloadClick}
                        onCopy={handleCopyImageClick}
                        disabled={isCopyingImage || isSharingImage}
                    />
                )}
            </div>
            
            <MemeHiddenRenderer 
                memeRef={memeRef}
                editorState={editorState}
                profile={profile}
                baseTextStyle={baseTextStyle}
                isTextSelected={isTextSelected}
                setIsTextSelected={setIsTextSelected}
            />
        </div>
    </div>
  );
}

