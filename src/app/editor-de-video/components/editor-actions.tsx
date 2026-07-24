
"use client";

import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import {
  Download, MoreVertical, Undo2, Redo2, Save, FilePlus, FolderUp, Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { useEditor } from "../contexts/editor-context";
import { useProfile } from '@/hooks/use-profile';
import { useProjects } from '@/hooks/use-projects';
import { captureThumbnail } from '../exportar';
import { useToast } from "@/hooks/use-toast";
import { generateFilename } from '@/lib/utils';
import { ExportModal, ExportOptions } from "./export-modal";
import { BatchWizardModal } from "./batch-wizard-modal";
import { BatchExportModal } from "./batch-export-modal";
import { BatchEngine } from "../batch/BatchEngine";
import { useSearchParams } from "next/navigation";

const getEditorExportMetadata = () => {
    if (typeof window === 'undefined') {
        return { category: undefined, subCategory: undefined };
    }
    const params = new URLSearchParams(window.location.search);
    return {
        category: params.get('category') || undefined,
        subCategory: params.get('subCategory') || undefined,
    };
};

export function EditorActions() {
    const searchParams = useSearchParams();
    const { 
        canUndo, undo, 
        canRedo, redo, 
        onSaveAsTemplate,
        onExportJPG,
        onExportPNG,
        onExportMP4,
        currentState,
        baseTextStyle,
        textEffectsStyle,
        dropShadowStyle,
        batchPages,
        setBatchState,
    } = useEditor();
    const { profile } = useProfile();
    const { addProject } = useProjects();
    const { toast } = useToast();
    const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
    const [videoPreview, setVideoPreview] = useState<{ url: string; blob: Blob } | null>(null);
    
    const [isBatchWizardOpen, setIsBatchWizardOpen] = useState(false);
    const [isBatchExportOpen, setIsBatchExportOpen] = useState(false);

    // Estados do novo Modal de Exportação
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);
    const [videoDuration, setVideoDuration] = useState(5);

    const handleCreateBatch = (quotes: string[], category: string, subCategory: string) => {
        if (!currentState) return;
        const pages = quotes.map(quote => ({
            ...currentState,
            text: quote
        }));
        setBatchState({ 
            batchPages: pages,
            batchCategory: category,
            batchSubCategory: subCategory
        });
        setIsBatchWizardOpen(false);
    };

    useEffect(() => {
      return () => {
        if (videoPreview) {
          URL.revokeObjectURL(videoPreview.url);
        }
      };
    }, [videoPreview]);

    useEffect(() => {
        if (searchParams.get('batch') === 'true') {
            setIsBatchWizardOpen(prev => {
                if (prev) return prev;
                return true;
            });
        }
    }, [searchParams]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement | null;
            const isEditableTarget = !!target && (
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.tagName === 'SELECT' ||
                target.isContentEditable
            );

            if (isEditableTarget) return;

            const isUndoShortcut = (event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === 'z';
            const isRedoShortcut = (event.ctrlKey || event.metaKey) && !event.altKey && (
                event.key.toLowerCase() === 'r' ||
                event.key.toLowerCase() === 'y' ||
                (event.key.toLowerCase() === 'z' && event.shiftKey)
            );

            if (isUndoShortcut) {
                event.preventDefault();
                if (canUndo) undo();
                return;
            }

            if (isRedoShortcut) {
                event.preventDefault();
                if (canRedo) redo();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [canUndo, canRedo, undo, redo]);

    const handleSave = async () => {
        if (!currentState) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Estado do editor não disponível.' });
            return;
        }

        const name = prompt('Nome do projeto:', 'Meu Projeto') || `Projeto_${new Date().toISOString()}`;

        toast({ title: 'Salvando projeto...', description: 'Gerando miniatura e salvando.' });

        try {
            // story aspect ratio thumbnail (9:16)
            const thumbWidth = 360;
            const thumbHeight = 640;
            const thumbnail = await captureThumbnail(toast, currentState, profile as any, baseTextStyle, textEffectsStyle, dropShadowStyle, thumbWidth, thumbHeight);

            const id = addProject({ name, thumbnail: thumbnail || '', editorState: currentState });
            toast({ title: 'Projeto salvo!', description: `O projeto foi salvo e aparecerá em Projetos.` });
        } catch (err) {
            console.error('Erro ao salvar projeto:', err);
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível salvar o projeto.' });
        }
    }

    const handleOpenExportModal = () => {
        const bgVideo = document.querySelector('#editor-preview-content video') as HTMLVideoElement | null;
        setVideoDuration(bgVideo?.duration || 5);
        setIsExportModalOpen(true);
        setExportProgress(0);
    };

    const handleStartExport = async (options: ExportOptions, isPreview: boolean) => {
        setIsGeneratingVideo(true);
        setExportProgress(0);
        
        try {
            const { blob, error } = await onExportMP4(options, (p) => setExportProgress(p));
            
            if (blob) {
                const url = URL.createObjectURL(blob);
                
                if (isPreview) {
                   setVideoPreview({ url, blob });
                } else {
                   const exportMetadata = getEditorExportMetadata();
                   const extension = blob.type.includes('mp4') ? 'mp4' : 'webm';
                   const filename = generateFilename(exportMetadata, extension as 'mp4' | 'webm');
                   const link = document.createElement('a');
                   link.href = url;
                   link.download = filename;
                   document.body.appendChild(link);
                   link.click();
                   document.body.removeChild(link);
                }
                
                toast({ title: 'Sucesso!', description: 'O vídeo foi gerado corretamente.' });
                setIsExportModalOpen(false); // Fecha o modal apenas se deu sucesso
            } else {
                toast({ 
                  variant: 'destructive', 
                  title: 'Erro de Exportação', 
                  description: error || 'Não foi possível gerar o vídeo. Tente recarregar a página.' 
                });
            }
        } catch (error: any) {
            toast({ 
              variant: 'destructive', 
              title: 'Erro Crítico', 
              description: `Ocorreu um erro ao processar o vídeo: ${error.message || 'Erro desconhecido'}` 
            });
        } finally {
            setIsGeneratingVideo(false);
        }
    };

    const closeVideoPreview = () => {
        if (videoPreview) {
            URL.revokeObjectURL(videoPreview.url);
        }
        setVideoPreview(null);
    };

    const downloadVideoPreview = () => {
        if (!videoPreview) return;

        const exportMetadata = getEditorExportMetadata();
        const extension = videoPreview.blob.type.includes('mp4') ? 'mp4' : 'webm';
        const filename = generateFilename(exportMetadata, extension as 'mp4' | 'webm');

        if (Capacitor.isNativePlatform()) {
            const reader = new FileReader();
            reader.readAsDataURL(videoPreview.blob);
            reader.onloadend = async () => {
                const base64Data = reader.result?.toString().split('base64,')[1];
                if (base64Data) {
                    try {
                        const { saveFileToAppFolder } = await import('@/lib/file-storage');
                        await saveFileToAppFolder(base64Data, filename, exportMetadata.category, exportMetadata.subCategory);
                        toast({ title: 'Sucesso!', description: `Arquivo salvo com sucesso em Downloads/InspireMe/${exportMetadata.category || 'Geral'}/${exportMetadata.subCategory || 'Geral'}.` });
                    } catch (err) {
                        console.error("Erro ao salvar vídeo nativamente:", err);
                        toast({ variant: 'destructive', title: 'Erro ao salvar', description: 'Não foi possível salvar o vídeo.' });
                    }
                }
                closeVideoPreview();
            };
            return;
        }

        const link = document.createElement('a');
        link.href = videoPreview.url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        closeVideoPreview(); // Fecha o modal de pré-visualização 
    };

  return (
    <>
        <div className="hidden md:flex items-center gap-1">
             <Button variant="ghost" size="icon" onClick={undo} disabled={!canUndo} aria-label="Desfazer" title="Desfazer (Ctrl+Z)">
                <Undo2 className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={redo} disabled={!canRedo} aria-label="Refazer" title="Refazer (Ctrl+R / Ctrl+Shift+Z)">
                <Redo2 className="h-5 w-5" />
            </Button>
            <Button variant="ghost" onClick={handleSave}>
                <Save className="h-5 w-5 mr-2" />
                Salvar
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsBatchWizardOpen(true)}>
                <FilePlus className="h-4 w-4 mr-2" />
                Projeto em Lote
            </Button>
        </div>

        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Download className="h-5 w-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleSave} className="md:hidden">
                    <Save className="mr-2 h-4 w-4" />
                    <span>Salvar Projeto</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsBatchWizardOpen(true)} className="md:hidden">
                    <FilePlus className="mr-2 h-4 w-4" />
                    <span>Projeto em Lote</span>
                </DropdownMenuItem>
                 <DropdownMenuItem onClick={() => toast({ title: "Em breve!", description: "A função 'Salvar Como' será adicionada."})}>
                    <FilePlus className="mr-2 h-4 w-4" />
                    <span>Salvar Como...</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="md:hidden" />
                <DropdownMenuItem onClick={onSaveAsTemplate}>
                    <FolderUp className="mr-2 h-4 w-4" />
                    <span>Salvar como Modelo</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {batchPages && batchPages.length > 1 ? (
                    <DropdownMenuItem onClick={() => setIsBatchExportOpen(true)} className="font-medium text-primary">
                        <Download className="mr-2 h-4 w-4" />
                        <span>Exportar Lote ({batchPages.length} pág.)</span>
                    </DropdownMenuItem>
                ) : (
                    <>
                        <DropdownMenuItem onClick={onExportJPG}>
                            <Download className="mr-2 h-4 w-4" />
                            <span>Exportar como JPG</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onExportPNG}>
                            <Download className="mr-2 h-4 w-4" />
                            <span>Exportar como PNG</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleOpenExportModal}>
                            <Share2 className="mr-2 h-4 w-4" />
                            <span>Exportar como Vídeo</span>
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>

        <BatchWizardModal 
            open={isBatchWizardOpen} 
            onOpenChange={setIsBatchWizardOpen} 
            onCreateBatch={handleCreateBatch} 
        />
        
        <BatchExportModal 
            open={isBatchExportOpen} 
            onOpenChange={setIsBatchExportOpen} 
        />

        {videoPreview && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-3xl max-h-[95vh] rounded-3xl border border-white/10 bg-background shadow-2xl overflow-hidden flex flex-col">
              <div className="flex items-center justify-between gap-4 border-b px-6 py-4">
                <div>
                  <p className="text-lg font-bold">Pré-visualização do vídeo</p>
                  <p className="text-sm text-muted-foreground">Confira o resultado final antes de baixar.</p>
                </div>
                <Button variant="ghost" size="icon" onClick={closeVideoPreview} className="rounded-full">
                  <span className="sr-only">Fechar</span>
                  <MoreVertical className="h-5 w-5 rotate-45" /> {/* Simples ícone de fechar */}
                </Button>
              </div>
              
              <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/20">
                <video
                  src={videoPreview.url}
                  controls
                  autoPlay
                  loop
                  className="max-w-full max-h-[65vh] rounded-xl shadow-lg bg-black object-contain"
                />
              </div>

              <div className="flex items-center justify-between gap-4 border-t px-6 py-4 bg-muted/30">
                <Button variant="outline" onClick={closeVideoPreview}>Cancelar</Button>
                <div className="flex items-center gap-2">
                   <Button onClick={downloadVideoPreview} className="font-semibold">
                     <Download className="mr-2 h-4 w-4" />
                     Baixar Vídeo
                   </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {isExportModalOpen && (
            <ExportModal 
               isExporting={isGeneratingVideo}
               progress={exportProgress}
               durationSeconds={videoDuration}
               onClose={() => !isGeneratingVideo && setIsExportModalOpen(false)}
               onExport={handleStartExport}
            />
        )}
    </>
  );
}
