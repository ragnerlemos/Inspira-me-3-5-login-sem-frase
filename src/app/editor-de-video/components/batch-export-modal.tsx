"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useEditor } from "../contexts/editor-context";
import { BatchEngine } from "../batch/BatchEngine";
import { useProfile } from "@/hooks/use-profile";

interface BatchExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const batchEngine = new BatchEngine();

export function BatchExportModal({ open, onOpenChange }: BatchExportModalProps) {
  const { batchPages, batchCategory = "Geral", batchSubCategory = "", projectName = "projeto-lote" } = useEditor() as any;
  const { profile } = useProfile();
  
  const [format, setFormat] = useState<"jpeg" | "png" | "zip" | "pdf">("jpeg");
  const [quality, setQuality] = useState(90);
  
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState("");
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
     if (open) {
        setIsExporting(false);
        setProgress(0);
        setPhase("");
        setStats(null);
     }
  }, [open]);

  useEffect(() => {
      batchEngine.registerOnProgress((p, ph) => {
          setProgress(p);
          setPhase(ph);
      });
      batchEngine.registerOnStatusChange((status) => {
          if (status === 'completed' || status === 'error' || status === 'cancelled') {
             setIsExporting(false);
          }
      });
  }, []);

  const handleStartExport = async () => {
      if (!profile || !batchPages || batchPages.length === 0) return;
      
      setIsExporting(true);
      setStats(null);
      setProgress(0);
      
      try {
          const result = await batchEngine.startExport(
              { id: 'tmp', name: projectName, pages: batchPages, createdBy: 'batch', currentPageIndex: 0, selectedPageIndices: [0] },
              profile,
              { format, jpegQuality: quality / 100, category: batchCategory, subCategory: batchSubCategory },
              () => {}
          );
          
          if (result) {
             if (result.blob) {
                const downloadName = `${result.baseName || "export"}.${format === "zip" ? "zip" : "pdf"}`;

                const url = URL.createObjectURL(result.blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = downloadName;
                a.click();
                URL.revokeObjectURL(url);
             } else if (result.files && result.files.length > 0) {
                for (let i = 0; i < result.files.length; i++) {
                   const file = result.files[i];
                   const url = URL.createObjectURL(file.blob);
                   const a = document.createElement("a");
                   a.href = url;
                   a.download = file.name;
                   document.body.appendChild(a);
                   a.click();
                   document.body.removeChild(a);
                   URL.revokeObjectURL(url);
                   // Delay to prevent browsers from blocking consecutive downloads
                   await new Promise(resolve => setTimeout(resolve, 300));
                }
             }
             setStats(result.stats);
          }
      } catch (e) {
          console.error(e);
      }
  };

  const handleCancel = () => {
      batchEngine.cancel();
      setIsExporting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Exportar em Lote</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          
          {!isExporting && !stats && (
              <>
                 <div className="flex flex-col gap-3">
                   <Label>Formato de Saída</Label>
                   <Select value={format} onValueChange={(v: any) => setFormat(v)}>
                     <SelectTrigger>
                       <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="zip">Arquivo ZIP (JPEG)</SelectItem>
                        <SelectItem value="jpeg">Imagens JPEG Individuais</SelectItem>
                       <SelectItem value="pdf">Documento PDF</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>

                 {(format === "zip" || format === "jpeg") && (
                     <div className="flex flex-col gap-3">
                       <div className="flex justify-between">
                         <Label>Qualidade (JPEG)</Label>
                         <span className="text-xs text-muted-foreground">{quality}%</span>
                       </div>
                       <Slider value={[quality]} onValueChange={v => setQuality(v[0])} max={100} min={10} step={5} />
                     </div>
                 )}
                 
                 <div className="bg-muted p-3 rounded-md text-sm text-center">
                     Exportar {batchPages?.length || 0} páginas.
                 </div>
              </>
          )}

          {isExporting && (
              <div className="flex flex-col gap-4 items-center justify-center py-8">
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                      <div className="bg-primary h-full transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="text-sm font-medium">
                      {progress}% - {phase === 'rendering' ? 'Renderizando...' : phase === 'compressing' ? 'Comprimindo...' : 'Exportando...'}
                  </div>
              </div>
          )}
          
          {stats && !isExporting && (
             <div className="flex flex-col gap-2 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium text-green-600 mb-2">Exportação concluída com sucesso!</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                   <div>Páginas: <span className="font-medium text-foreground">{stats.exportedCount}</span></div>
                   <div>Erros: <span className="font-medium text-foreground">{stats.errorCount}</span></div>
                   <div>Tempo Médio: <span className="font-medium text-foreground">{Math.round(stats.averageTimePerPageMs)}ms</span></div>
                   <div>Tamanho Total: <span className="font-medium text-foreground">{(stats.totalSizeInBytes / 1024 / 1024).toFixed(2)} MB</span></div>
                </div>
             </div>
          )}

        </div>

        <DialogFooter>
          {isExporting ? (
             <Button variant="destructive" onClick={handleCancel}>Cancelar</Button>
          ) : stats ? (
             <Button onClick={() => onOpenChange(false)}>Fechar</Button>
          ) : (
             <>
               <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
               <Button onClick={handleStartExport}>Iniciar Exportação</Button>
             </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
