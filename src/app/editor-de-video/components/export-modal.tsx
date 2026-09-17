"use client";

import React, { useState, useMemo } from 'react';
import { Download, X, Film, MonitorPlay, Activity, Zap, Sparkles, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ExportOptions {
  resolutionId: string;
  fps: number;
  format: 'mp4' | 'webm' | 'gif';
  quality: 'low' | 'medium' | 'high';
  bitrateMbps: number;
  renderScale: number;
  exportMode?: 'gpu_native' | 'gpu_worker' | 'ffmpeg_fast' | 'ffmpeg_quality';
  signal?: AbortSignal;
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
  onCancel?: () => void;
  onExport: (options: ExportOptions, isPreview: boolean) => void;
  isExporting: boolean;
  progress: number;
  durationSeconds: number; // Para calcular tamanho estimado
  errorMessage?: string | null;
  onClearError?: () => void;
}

export function ExportModal({ onClose, onCancel, onExport, isExporting, progress, durationSeconds, errorMessage, onClearError }: ExportModalProps) {
  const [resolutionId, setResolutionId] = useState('1080p');
  const [fps, setFps] = useState(30);
  const [format, setFormat] = useState<'mp4' | 'webm' | 'gif'>('mp4');
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('high');
  const [exportMode, setExportMode] = useState<'gpu_native' | 'gpu_worker' | 'ffmpeg_fast' | 'ffmpeg_quality'>('gpu_worker');

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
        renderScale: res?.scale || 1.0,
        exportMode,
    }, isPreview);
  };

  return (
    <div 
      className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md transition-opacity"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isExporting) {
          onClose();
        }
      }}
    >
        <div className="w-full max-w-md bg-zinc-950 sm:rounded-3xl border-t sm:border border-white/10 shadow-2xl overflow-hidden flex flex-col pt-2 animate-in slide-in-from-bottom-5 sm:slide-in-from-bottom-0 sm:fade-in-0 duration-300">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Download className="w-5 h-5 text-primary" />
                    Exportar Projeto
                </h2>
                <button 
                  onClick={() => {
                    if (!isExporting) onClose();
                  }} 
                  disabled={isExporting}
                  className={`p-2 rounded-full transition-colors ${
                    isExporting 
                      ? 'opacity-30 cursor-not-allowed text-white/30' 
                      : 'bg-white/5 hover:bg-white/10 text-white/80 hover:text-white'
                  }`}
                  title={isExporting ? "Exportação em andamento" : "Fechar Modal"}
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="p-6 space-y-6">
                {errorMessage ? (
                    <div className="flex flex-col items-center justify-center py-6 space-y-4">
                        <div className="w-16 h-16 bg-red-500/20 text-red-400 flex items-center justify-center rounded-full">
                            <X className="w-8 h-8 text-red-400" />
                        </div>
                        <h3 className="text-base font-semibold text-red-400">Falha na Exportação</h3>
                        <p className="text-xs text-white/70 text-center max-w-[300px] bg-red-950/40 border border-red-800/40 p-3 rounded-xl font-mono">
                          {errorMessage}
                        </p>
                        <Button 
                            onClick={onClearError} 
                            className="rounded-full px-6 font-semibold bg-primary hover:bg-primary/90 text-background shadow-lg"
                        >
                            Tentar Novamente
                        </Button>
                    </div>
                ) : isExporting ? (
                    <div className="flex flex-col items-center justify-center py-8 space-y-4">
                        <div className="w-20 h-20 mb-2 bg-primary/20 flex items-center justify-center rounded-full animate-pulse">
                            <Download className="w-10 h-10 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold">Renderizando vídeo...</h3>
                        <p className="text-xs text-white/50 text-center max-w-[280px]">
                            Clique no "X" acima ou no botão abaixo para interromper imediatamente.
                        </p>
                        
                        <div className="w-full mt-4 bg-white/10 rounded-full h-3 overflow-hidden relative">
                            <div 
                                className="bg-primary h-full rounded-full transition-all duration-300 ease-out" 
                                style={{ width: `${progress}%` }} 
                            />
                        </div>
                        <p className="font-mono text-2xl font-bold text-primary mt-1">{progress}%</p>

                        <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={onCancel || onClose}
                            className="mt-4 rounded-full px-6 font-semibold flex items-center gap-2 bg-red-600/80 hover:bg-red-600 text-white shadow-lg"
                        >
                            <X className="w-4 h-4" />
                            Cancelar Exportação
                        </Button>
                    </div>
                ) : (
                    <>
                    {/* Modo de Processamento */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold flex items-center justify-between text-white/90">
                            <span className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-amber-400" /> 
                                Modo de Processamento
                            </span>
                            <span className="text-[11px] text-amber-400 font-normal">
                                {exportMode === 'gpu_worker' ? '⚡ Web Worker (Off-thread Extremo)' : exportMode === 'gpu_native' ? '⚡ GPU Nativo (Ultra Rápido)' : exportMode === 'ffmpeg_fast' ? '🚀 FFmpeg Otimizado' : '🎬 Alta Fidelidade'}
                            </span>
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <button
                                type="button"
                                onClick={() => setExportMode('gpu_worker')}
                                className={`p-2 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${exportMode === 'gpu_worker' ? 'bg-amber-500/20 border-amber-500/80 text-amber-300 ring-1 ring-amber-500 shadow-lg shadow-amber-500/10' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'}`}
                            >
                                <Zap className="w-4 h-4 mb-1 text-amber-400 animate-pulse" />
                                <span className="text-[11px] font-bold">⚡ Worker GPU</span>
                                <span className="text-[9px] opacity-70 leading-none mt-0.5">Off-Thread</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setExportMode('gpu_native')}
                                className={`p-2 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${exportMode === 'gpu_native' ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 ring-1 ring-amber-500/50 shadow-lg shadow-amber-500/10' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'}`}
                            >
                                <Zap className="w-4 h-4 mb-1 text-amber-400" />
                                <span className="text-[11px] font-bold">⚡ Ultra GPU</span>
                                <span className="text-[9px] opacity-70 leading-none mt-0.5">2-5 seg</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setExportMode('ffmpeg_fast')}
                                className={`p-2 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${exportMode === 'ffmpeg_fast' ? 'bg-primary/20 border-primary/60 text-primary ring-1 ring-primary/50' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'}`}
                            >
                                <Sparkles className="w-4 h-4 mb-1 text-primary" />
                                <span className="text-[11px] font-bold">🚀 Rápido</span>
                                <span className="text-[9px] opacity-70 leading-none mt-0.5">Ultrafast</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setExportMode('ffmpeg_quality')}
                                className={`p-2 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${exportMode === 'ffmpeg_quality' ? 'bg-blue-500/20 border-blue-500/60 text-blue-300 ring-1 ring-blue-500/50' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'}`}
                            >
                                <Cpu className="w-4 h-4 mb-1 text-blue-400" />
                                <span className="text-[11px] font-bold">🎬 Qualidade</span>
                                <span className="text-[9px] opacity-70 leading-none mt-0.5">HD Máximo</span>
                            </button>
                        </div>
                    </div>

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
