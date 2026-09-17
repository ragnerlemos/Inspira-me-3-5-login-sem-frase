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
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [currentText, setCurrentText] = useState<string>(quote?.quote || editorState.text || "");
  const [memeUrl, setMemeUrl] = useState<string | null>(null);
  const [memeFile, setMemeFile] = useState<File | null>(null);
  const [isTextSelected, setIsTextSelected] = useState(false);
  const [isCopyingImage, setIsCopyingImage] = useState(false);
  const [isSharingImage, setIsSharingImage] = useState(false);
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState<number>(1);
  const [textBoxWidth, setTextBoxWidth] = useState<number>(editorState.textBoxWidth ?? 80);
  const [textMarginLeft, setTextMarginLeft] = useState<number | undefined>(editorState.textMarginLeft);
  const [textMarginRight, setTextMarginRight] = useState<number | undefined>(editorState.textMarginRight);
  const [lineHeight, setLineHeight] = useState<number>(editorState.lineHeight ?? 1.4);
  const { toast } = useToast();

  const [isBold, setIsBold] = useState(
    editorState.fontWeight === 'bold' || 
    editorState.fontWeight === '700' || 
    editorState.fontWeight === undefined || 
    (editorState.fontWeight !== 'normal' && editorState.fontWeight !== '400')
  );
  const [isItalic, setIsItalic] = useState(editorState.fontStyle === 'italic');

  const toggleBold = () => {
    setIsBold(!isBold);
  };

  const toggleItalic = () => {
    setIsItalic(!isItalic);
  };
  
  const currentEditorState = {
    ...editorState,
    text: currentText,
    fontSize: (editorState.fontSize || 2) * fontSizeMultiplier,
    textBoxWidth: textBoxWidth,
    textMarginLeft: textMarginLeft,
    textMarginRight: textMarginRight,
    lineHeight: lineHeight,
    fontWeight: isBold ? 'bold' : 'normal',
    fontStyle: isItalic ? 'italic' : 'normal',
  };

  const handleTextBoxResize = ({ widthPct, marginLeftPct, marginRightPct, fontSize, lineHeight: nextLineHeight }: { widthPct?: number; heightPx?: number; marginLeftPct?: number; marginRightPct?: number; fontSize?: number; lineHeight?: number }) => {
    if (widthPct !== undefined) {
      setTextBoxWidth(widthPct);
    }
    if (marginLeftPct !== undefined) {
      setTextMarginLeft(marginLeftPct);
    }
    if (marginRightPct !== undefined) {
      setTextMarginRight(marginRightPct);
    }
    if (fontSize !== undefined && editorState.fontSize) {
      setFontSizeMultiplier(fontSize / editorState.fontSize);
    }
    if (nextLineHeight !== undefined) {
      setLineHeight(nextLineHeight);
    }
  };

  const baseTextStyle: EstiloTexto = {
      fontFamily: currentEditorState.fontFamily,
      fontSize: `${currentEditorState.fontSize}cqw`,
      fontWeight: currentEditorState.fontWeight || 'normal',
      fontStyle: currentEditorState.fontStyle || 'normal',
      color: currentEditorState.textColor,
      textAlign: currentEditorState.textAlign,
      lineHeight: currentEditorState.lineHeight,
  };
  
  useEffect(() => {
    let active = true;
    const generateAndProcess = async () => {
      if (!memeRef.current) return;
      
      try {
        await document.fonts.ready;
        await new Promise(resolve => setTimeout(resolve, 150)); // Aguarda a renderização
        
        if (!active) return;

        const { toJpeg } = await import('html-to-image');
        const node = memeRef.current;
        const rect = node.getBoundingClientRect();
        
        const dataUrl = await toJpeg(node, {
            quality: 1, // Aumentando qualidade
            pixelRatio: 2, // Ajustando pixel ratio
            backgroundColor: '#000000',
            cacheBust: true, // Evitar cache
            width: rect.width,
            height: rect.height,
            style: {
                transform: 'none', // Forçar transformação normal
                width: `${rect.width}px`,
                height: `${rect.height}px`
            }
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
  }, [shareDirectly, quote, toast, onClose, fontSizeMultiplier, textBoxWidth, lineHeight, currentText]);

  const ensureLatestMeme = async () => {
    // Captura com prioridade máxima o elemento que o usuário está visualizando exatamente na tela
    const targetElement = previewContainerRef.current || (typeof document !== 'undefined' ? document.getElementById('meme-preview-image-container') : null) || memeRef.current;
    if (!targetElement) return { url: memeUrl, file: memeFile, filename: generateFilename({ ...quote, quote: currentText }, 'jpg') };

    // Desmarca a seleção da caixa de texto para não renderizar bordas roxas ou alças de redimensionamento
    setIsTextSelected(false);

    try {
      await document.fonts.ready;
      await new Promise(resolve => setTimeout(resolve, 80));

      const { toJpeg } = await import('html-to-image');
      const targetWidth = targetElement.clientWidth || 340;
      // Proporção de alta resolução (1080px de largura) mantendo 100% fiel a diagramação e quebra de linhas do que está na tela
      const pixelRatio = Math.max(2, Math.round(1080 / targetWidth));

      const dataUrl = await toJpeg(targetElement, {
          quality: 0.98,
          pixelRatio: pixelRatio,
          backgroundColor: '#000000',
          cacheBust: true,
          width: targetElement.getBoundingClientRect().width,
          height: targetElement.getBoundingClientRect().height,
          filter: (node) => {
              if (node instanceof HTMLElement && (node.classList?.contains('export-ignore') || node.getAttribute('aria-label') === 'Fechar')) {
                  return false;
              }
              return true;
          },
          style: {
              borderRadius: '0px',
              transform: 'none',
              width: `${targetElement.getBoundingClientRect().width}px`,
              height: `${targetElement.getBoundingClientRect().height}px`
          }
      });
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const filename = generateFilename({ ...quote, quote: currentText }, 'jpg');
      const fileObj = new File([blob], filename, { type: 'image/jpeg' });
      const newUrl = URL.createObjectURL(blob);
      setMemeFile(fileObj);
      setMemeUrl(newUrl);
      return { url: newUrl, file: fileObj, blob, filename };
    } catch (e) {
      console.error("Erro ao gerar imagem recente:", e);
      return { url: memeUrl, file: memeFile, filename: generateFilename({ ...quote, quote: currentText }, 'jpg') };
    }
  };

  const handleShareImageClick = async () => {
    setIsSharingImage(true);
    try {
      const latest = await ensureLatestMeme();
      const fileToShare = latest.file || memeFile;
      if (fileToShare && navigator.share && navigator.canShare && navigator.canShare({ files: [fileToShare] })) {
        await navigator.share({
          files: [fileToShare],
        });
      } else {
        toast({
          title: "Compartilhamento não suportado",
          description: "Seu navegador não suporta compartilhamento direto de arquivos. Por favor, utilize a opção de Baixar ou Copiar.",
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
    setIsCopyingImage(true);
    try {
      const latest = await ensureLatestMeme();
      const activeBlob = latest.blob;
      const blobToProcess = activeBlob || (memeUrl ? await (await fetch(memeUrl)).blob() : null);
      if (!blobToProcess) {
        throw new Error("Imagem não encontrada para cópia.");
      }
      
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
            img.src = URL.createObjectURL(blobToProcess);
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
    const latest = await ensureLatestMeme();
    const activeUrl = latest.url || memeUrl;
    if (!activeUrl) return;
    
    const filename = latest.filename || generateFilename({ ...quote, quote: currentText }, 'jpg');

    if (Capacitor.isNativePlatform()) {
      try {
        const response = await fetch(activeUrl);
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
        };
      } catch (err) {
        console.error("Erro ao converter blob nativamente:", err);
        toast({ variant: 'destructive', title: 'Erro de download', description: 'Ocorreu um erro ao baixar a imagem.' });
      }
      return;
    }

    const link = document.createElement('a');
    link.href = activeUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({ title: 'Sucesso!', description: `Seu meme foi baixado como ${filename}.` });
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
    <div className="fixed inset-0 bg-black/85 z-[100] flex items-center justify-center p-1 sm:p-2" onClick={onClose}>
        <div className="relative w-full max-w-md sm:max-w-xl mx-auto h-[96vh] sm:h-auto flex flex-col justify-center" onClick={(e) => e.stopPropagation()}>
            <div className="relative flex flex-col items-center gap-2 bg-[#27272a] border border-zinc-700 p-3 sm:p-4 rounded-2xl shadow-2xl w-full" onPointerDown={() => setIsTextSelected(false)}>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={onClose} 
                    className="absolute right-3 top-3 z-50 text-zinc-400 hover:text-white bg-zinc-800/80 hover:bg-zinc-700 rounded-full h-7 w-7 flex items-center justify-center transition-colors" 
                    aria-label="Fechar"
                >
                    <X className="h-4 w-4" />
                </Button>
                <MemePreview 
                    previewContainerRef={previewContainerRef}
                    memeUrl={memeUrl} 
                    editorState={currentEditorState}
                    profile={profile}
                    baseTextStyle={baseTextStyle}
                    isTextSelected={isTextSelected}
                    setIsTextSelected={setIsTextSelected}
                    onTextBoxResize={handleTextBoxResize}
                    text={currentText}
                    onTextChange={setCurrentText}
                    onDownload={handleDownloadClick} 
                    fontSizeMultiplier={fontSizeMultiplier}
                    onFontSizeChange={setFontSizeMultiplier}
                    textBoxWidth={textBoxWidth}
                    onTextBoxWidthChange={setTextBoxWidth}
                    onToggleBold={toggleBold}
                    onToggleItalic={toggleItalic}
                />
                
                {memeUrl && (
                    <MemeActions 
                        isSharingSupported={isSharingSupported}
                        isCopyingImage={isCopyingImage}
                        isSharingImage={isSharingImage}
                        onShare={handleShareImageClick}
                        onDownload={handleDownloadClick}
                        onCopy={handleCopyImageClick}
                        onClose={onClose}
                        disabled={isCopyingImage || isSharingImage}
                    />
                )}
            </div>
            
            <MemeHiddenRenderer 
                memeRef={memeRef} 
                editorState={currentEditorState}
                profile={profile}
                baseTextStyle={baseTextStyle}
                isTextSelected={false}
                setIsTextSelected={() => {}}
            />
        </div>
    </div>
  );
}
