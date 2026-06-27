"use client";

import React, { useState, useMemo } from 'react';
import { Download, X, Film, MonitorPlay, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ExportOptions {
  resolutionId: string;
  fps: number;
  format: 'mp4' | 'webm' | 'gif';
  quality: 'low' | 'medium' | 'high';
  bitrateMbps: number;
  renderScale: number;
}

export const RESOLUTIONS = [
  { id: '360p', label: '360p', scale: 0.5 },
  { id: '480p', label: '480p', scale: 0.75 },
  { id: '720p', label: '720p', scale: 1.0 },
  { id: '1080p', label: '1080p', scale: 1.5 },
  { id: '1440p', label: '2K', scale: 2.0 },
  { id: '2160p', label: '4K', scale: 3.0 },
];

export const FPS_OPTIONS = [24, 30, 60];

const BITRATE_MAP = {
  '360p': { low: 0.5, medium: 1, high: 2 },
  '480p': { low: 1, medium: 1.5, high: 3 },
  '720p': { low: 2, medium: 3, high: 5 },
  '1080p': { low: 4, medium: 5, high: 8 },
  '1440p': { low: 6, medium: 10, high: 15 },
  '2160p': { low: 15, medium: 30, high: 50 },
};

interface ExportModalProps {
  onClose: () => void;
  onExport: (options: ExportOptions, isPreview: boolean) => void;
  isExporting: boolean;
  progress: number;
  durationSeconds: number; // Para calcular tamanho estimado
}

export function ExportModal({ onClose, onExport, isExporting, progress, durationSeconds }: ExportModalProps) {
  const [resolutionId, setResolutionId] = useState('1080p');
  const [fps, setFps] = useState(30);
  const [format, setFormat] = useState<'mp4' | 'webm' | 'gif'>('mp4');
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('high');

  // Cálculos dinâmicos
  const bitrateMbps = useMemo(() => {
     const br = BITRATE_MAP[resolutionId as keyof typeof BITRATE_MAP];
     return br ? br[quality] : 5;
  }, [resolutionId, quality]);

  const estimatedSizeMB = useMemo(() => {
    // formula: tamanho em MB = (Mbps / 8) * duration_em_segundos
    // Adicionar ~10% de margem no cálculo para variações
    const size = (bitrateMbps / 8) * (durationSeconds || 5) * 1.1; 
    return size.toFixed(1);
  }, [bitrateMbps, durationSeconds]);

  const handleStartExport = (isPreview: boolean) => {
    const res = RESOLUTIONS.find(r => r.id === resolutionId);
    onExport({
        resolutionId,
        fps,
        format,
        quality,
        bitrateMbps,
        renderScale: res?.scale || 1.0
    }, isPreview);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md transition-opacity">
        <div className="w-full max-w-md bg-zinc-950 sm:rounded-3xl border-t sm:border border-white/10 shadow-2xl overflow-hidden flex flex-col pt-2 animate-in slide-in-from-bottom-5 sm:slide-in-from-bottom-0 sm:fade-in-0 duration-300">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Download className="w-5 h-5 text-primary" />
                    Exportar Projeto
                </h2>
                {!isExporting && (
                  <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
                      <X className="w-5 h-5" />
                  </button>
                )}
            </div>

            <div className="p-6 space-y-6">
                {isExporting ? (
                    <div className="flex flex-col items-center justify-center py-10 space-y-4">
                        <div className="w-20 h-20 mb-4 bg-primary/20 flex items-center justify-center rounded-full animate-pulse">
                            <Download className="w-10 h-10 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold">Renderizando...</h3>
                        <p className="text-sm text-white/50 text-center max-w-[250px]">
                            Por favor, não feche o aplicativo enquanto o vídeo está sendo processado.
                        </p>
                        
                        <div className="w-full mt-6 bg-white/10 rounded-full h-3 overflow-hidden relative">
                            <div 
                                className="bg-primary h-full rounded-full transition-all duration-300 ease-out" 
                                style={{ width: `${progress}%` }} 
                            />
                        </div>
                        <p className="font-mono text-2xl font-bold text-primary mt-2">{progress}%</p>
                    </div>
                ) : (
                    <>
                    {/* Resolução */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold flex items-center gap-2 text-white/80">
                            <MonitorPlay className="w-4 h-4 text-white/50" /> 
                            Resolução
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {RESOLUTIONS.map(res => (
                                <button 
                                    key={res.id} 
                                    onClick={() => setResolutionId(res.id)}
                                    className={`py-3 rounded-xl border text-sm font-medium transition-all ${resolutionId === res.id ? 'bg-primary border-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.3)]' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'}`}
                                >
                                    {res.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Taxa de Quadros */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold flex items-center gap-2 text-white/80">
                            <Activity className="w-4 h-4 text-white/50" /> 
                            Taxa de Quadros (FPS)
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {FPS_OPTIONS.map(f => (
                                <button 
                                    key={f} 
                                    onClick={() => setFps(f)}
                                    className={`py-2 rounded-xl border text-sm font-medium transition-all ${fps === f ? 'bg-zinc-800 border-zinc-600 text-white' : 'bg-transparent border-white/10 text-white/60 hover:bg-white/5'}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                         {/* Formato */}
                        <div className="space-y-3">
                            <label className="text-sm font-semibold flex items-center gap-2 text-white/80">
                                <Film className="w-4 h-4 text-white/50" /> 
                                Formato
                            </label>
                            <div className="flex bg-white/5 rounded-xl border border-white/10 p-1">
                                {['mp4', 'webm', 'gif'].map((f) => (
                                   <button 
                                     key={f} 
                                     onClick={() => setFormat(f as any)}
                                     className={`flex-1 py-2 rounded-lg text-xs font-semibold uppercase transition-colors ${format === f ? 'bg-white/10 text-white' : 'text-white/40'}`}
                                   >
                                     {f}
                                   </button>
                                ))}
                            </div>
                        </div>

                         {/* Qualidade */}
                         <div className="space-y-3">
                            <label className="text-sm font-semibold flex items-center gap-2 text-white/80">
                                Qualidade
                            </label>
                            <div className="flex bg-white/5 rounded-xl border border-white/10 p-1">
                                {['low', 'medium', 'high'].map((q) => (
                                   <button 
                                     key={q} 
                                     onClick={() => setQuality(q as any)}
                                     className={`flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-colors ${quality === q ? 'bg-white/10 text-white' : 'text-white/40'}`}
                                   >
                                     {q === 'low' ? 'Baixa' : q === 'medium' ? 'Média' : 'Alta'}
                                   </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Estimativa e Botão */}
                    <div className="pt-4 mt-2 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <p className="text-xs text-white/50 uppercase tracking-wider font-semibold">Tamanho Estimado</p>
                            <p className="text-lg font-bold">~ {estimatedSizeMB} MB</p>
                            {format === 'gif' && <p className="text-[10px] text-yellow-500 max-w-[120px] leading-tight mt-1">GIFs tendem a ser maiores e sem áudio.</p>}
                        </div>
                        <div className="flex w-full sm:w-auto items-center gap-2">
                           <Button 
                              size="lg" 
                              variant="outline"
                              onClick={() => handleStartExport(true)} 
                              className="flex-1 sm:flex-none rounded-full px-4 sm:px-6 font-bold shadow-xl border-white/20 hover:bg-white/10"
                           >
                               Pré-visualizar
                           </Button>
                           <Button 
                               size="lg" 
                               onClick={() => handleStartExport(false)} 
                               className="flex-1 sm:flex-none rounded-full px-4 sm:px-6 font-bold bg-primary hover:bg-primary/90 text-background shadow-xl"
                           >
                               Exportar Direto
                           </Button>
                        </div>
                    </div>
                    </>
                )}
            </div>
        </div>
    </div>
  );
}
