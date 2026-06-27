
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
import { useToast } from "@/hooks/use-toast";
import { ExportModal, ExportOptions } from "./export-modal";

export function EditorActions() {
    const { 
        canUndo, undo, 
        canRedo, redo, 
        onSaveAsTemplate,
        onExportJPG,
        onExportPNG,
        onExportMP4,
    } = useEditor();
    const { toast } = useToast();
    const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
    const [videoPreview, setVideoPreview] = useState<{ url: string; blob: Blob } | null>(null);
    
    // Estados do novo Modal de Exportação
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);
    const [videoDuration, setVideoDuration] = useState(5);

    useEffect(() => {
      return () => {
        if (videoPreview) {
          URL.revokeObjectURL(videoPreview.url);
        }
      };
    }, [videoPreview]);

    const handleSave = () => {
        // Lógica de salvamento será implementada aqui
        toast({ title: 'Projeto Salvo!'});
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
                   const extension = blob.type.includes('mp4') ? 'mp4' : 'webm';
                   const link = document.createElement('a');
                   link.href = url;
                   link.download = `inspire-me-export-${Date.now()}.${extension}`;
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

        const extension = videoPreview.blob.type.includes('mp4') ? 'mp4' : 'webm';
        const filename = `inspire-me-export-${Date.now()}.${extension}`;

        if (Capacitor.isNativePlatform()) {
            const reader = new FileReader();
            reader.readAsDataURL(videoPreview.blob);
            reader.onloadend = async () => {
                const base64Data = reader.result?.toString().split('base64,')[1];
                if (base64Data) {
                    try {
                        let categoryStr: string | undefined = undefined;
                        if (typeof window !== 'undefined') {
                            const params = new URLSearchParams(window.location.search);
                            const cat = params.get('category');
                            if (cat) categoryStr = cat;
                        }

                        const { saveFileToAppFolder } = await import('@/lib/file-storage');
                        await saveFileToAppFolder(base64Data, filename, categoryStr);
                        toast({ title: 'Sucesso!', description: `Vídeo salvo na pasta Download/InspiraMe/${categoryStr || ''} com sucesso.` });
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
             <Button variant="ghost" size="icon" onClick={undo} disabled={!canUndo} aria-label="Desfazer">
                <Undo2 className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={redo} disabled={!canRedo} aria-label="Refazer">
                <Redo2 className="h-5 w-5" />
            </Button>
            <Button variant="ghost" onClick={handleSave}>
                <Save className="h-5 w-5 mr-2" />
                Salvar
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
            </DropdownMenuContent>
        </DropdownMenu>

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
