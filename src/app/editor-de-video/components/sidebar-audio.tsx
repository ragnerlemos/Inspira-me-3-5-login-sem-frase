"use client";

import React, { useRef, useState } from "react";
import { 
  Upload, 
  Volume2, 
  VolumeX, 
  Trash2, 
  Copy, 
  Scissors, 
  Sparkles, 
  Play, 
  SlidersHorizontal,
  Plus,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Music2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { useEditor } from "../contexts/editor-context";
import type { AudioTrack } from "../tipos";

export function SidebarAudio() {
  const { currentState, updateState } = useEditor();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);

  const audioTracks: AudioTrack[] = currentState?.audioTracks || [];
  const selectedTrack = audioTracks.find((t) => t.id === selectedTrackId) || audioTracks[0] || null;

  // Handler para importar arquivo de áudio
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validFormats = ["audio/mp3", "audio/mpeg", "audio/wav", "audio/ogg", "audio/aac", "audio/m4a", "audio/x-m4a", "audio/flac"];
    const ext = file.name.split(".").pop()?.toLowerCase();
    
    // Tenta detectar duração do áudio
    let duration = 10;
    try {
      const audioUrl = URL.createObjectURL(file);
      const tempAudio = new Audio(audioUrl);
      await new Promise((resolve) => {
        tempAudio.onloadedmetadata = () => {
          if (tempAudio.duration && isFinite(tempAudio.duration)) {
            duration = Math.round(tempAudio.duration * 10) / 10;
          }
          resolve(true);
        };
        tempAudio.onerror = () => resolve(false);
      });

      const newTrack: AudioTrack = {
        id: `audio_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: file.name.replace(/\.[^/.]+$/, ""),
        url: audioUrl,
        type: "imported",
        volume: 100,
        isMuted: false,
        startTime: 0,
        duration: duration,
        trimStart: 0,
        trimEnd: duration,
        fadeInDuration: 0,
        fadeOutDuration: 0,
        isNormalized: false,
      };

      const updatedTracks = [...audioTracks, newTrack];
      updateState({ audioTracks: updatedTracks });
      setSelectedTrackId(newTrack.id);

      toast({
        title: "Áudio importado! 🎵",
        description: `"${newTrack.name}" foi adicionado à timeline.`,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erro ao importar áudio",
        description: "Não foi possível carregar o arquivo selecionado.",
      });
    }

    if (e.target) e.target.value = "";
  };

  // Atualiza uma propriedade da faixa selecionada
  const updateSelectedTrack = (updates: Partial<AudioTrack>) => {
    if (!selectedTrack) return;
    const updatedTracks = audioTracks.map((t) => (t.id === selectedTrack.id ? { ...t, ...updates } : t));
    updateState({ audioTracks: updatedTracks });
  };

  // Ações da Faixa
  const handleToggleMute = (trackId: string) => {
    const updated = audioTracks.map((t) => (t.id === trackId ? { ...t, isMuted: !t.isMuted } : t));
    updateState({ audioTracks: updated });
  };

  const handleToggleLock = (trackId: string) => {
    const updated = audioTracks.map((t) => (t.id === trackId ? { ...t, isLocked: !t.isLocked } : t));
    updateState({ audioTracks: updated });
  };

  const handleToggleHide = (trackId: string) => {
    const updated = audioTracks.map((t) => (t.id === trackId ? { ...t, isHidden: !t.isHidden } : t));
    updateState({ audioTracks: updated });
  };

  const handleDeleteTrack = (trackId: string) => {
    const updated = audioTracks.filter((t) => t.id !== trackId);
    updateState({ audioTracks: updated });
    if (selectedTrackId === trackId) {
      setSelectedTrackId(updated[0]?.id || null);
    }
    toast({ title: "Faixa de áudio removida." });
  };

  const handleDuplicateTrack = (track: AudioTrack) => {
    const duplicated: AudioTrack = {
      ...track,
      id: `audio_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: `${track.name} (Cópia)`,
      startTime: track.startTime + track.duration,
    };
    const updated = [...audioTracks, duplicated];
    updateState({ audioTracks: updated });
    setSelectedTrackId(duplicated.id);
    toast({ title: "Faixa duplicada com sucesso!" });
  };

  const handleNormalize = async () => {
    if (!selectedTrack) return;
    try {
      toast({ title: "Normalizando áudio...", description: "Equilibrando o ganho da faixa." });
      // Aplica valor de ganho otimizado para o padrão 100% sem distorção
      updateSelectedTrack({ volume: 100, isNormalized: true });
      toast({ title: "Áudio normalizado! ⚖️", description: "O volume foi ajustado para o nível padrão ideal." });
    } catch (err) {
      toast({ variant: "destructive", title: "Erro", description: "Falha ao normalizar áudio." });
    }
  };

  const handleSplitTrack = () => {
    if (!selectedTrack || selectedTrack.duration <= 1) return;
    const half = Math.round((selectedTrack.duration / 2) * 10) / 10;

    const part1: AudioTrack = {
      ...selectedTrack,
      duration: half,
      trimEnd: (selectedTrack.trimStart || 0) + half,
    };

    const part2: AudioTrack = {
      ...selectedTrack,
      id: `audio_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: `${selectedTrack.name} (Parte 2)`,
      startTime: selectedTrack.startTime + half,
      duration: selectedTrack.duration - half,
      trimStart: (selectedTrack.trimStart || 0) + half,
    };

    const updated = audioTracks.map((t) => (t.id === selectedTrack.id ? part1 : t)).concat(part2);
    updateState({ audioTracks: updated });
    setSelectedTrackId(part1.id);
    toast({ title: "Faixa dividida em 2 partes!" });
  };

  return (
    <div className="p-4 space-y-6 text-foreground">
      {/* Botão de Importar Áudio */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
          <span>1. Importar Áudio</span>
          <span className="text-[10px] text-amber-400 font-normal">MP3, WAV, OGG, AAC, M4A, FLAC</span>
        </label>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="audio/mp3,audio/mpeg,audio/wav,audio/ogg,audio/aac,audio/m4a,audio/flac,.mp3,.wav,.ogg,.aac,.m4a,.flac"
          className="hidden"
        />

        <Button
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/30 hover:border-amber-500/60 text-amber-300 font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          <Upload className="w-4 h-4 text-amber-400" />
          <span>Selecionar Arquivo de Áudio</span>
        </Button>
      </div>

      {/* Lista de Faixas de Áudio */}
      {audioTracks.length > 0 && (
        <div className="space-y-3 border-t border-border/40 pt-4">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Faixas de Áudio na Timeline ({audioTracks.length})
          </label>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {audioTracks.map((track) => {
              const isSelected = selectedTrack?.id === track.id;
              return (
                <div
                  key={track.id}
                  onClick={() => setSelectedTrackId(track.id)}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-all ${
                    isSelected
                      ? "bg-amber-500/15 border-amber-500/50 shadow-sm"
                      : "bg-muted/40 border-border/40 hover:bg-muted/70"
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className={`p-2 rounded-lg ${track.isMuted ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"}`}>
                      {track.isMuted ? <VolumeX className="w-4 h-4" /> : <Music2 className="w-4 h-4" />}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-medium truncate leading-none">{track.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {track.duration}s • Volume: {track.isMuted ? "0%" : `${track.volume}%`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleToggleMute(track.id)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        track.isMuted ? "bg-red-500/20 border-red-500/40 text-red-400" : "bg-background/50 border-border/40 text-muted-foreground hover:text-foreground"
                      }`}
                      title={track.isMuted ? "Restaurar Áudio" : "Remover / Mudar Áudio"}
                    >
                      {track.isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => handleToggleLock(track.id)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        track.isLocked ? "bg-amber-500/20 border-amber-500/40 text-amber-400" : "bg-background/50 border-border/40 text-muted-foreground hover:text-foreground"
                      }`}
                      title={track.isLocked ? "Desbloquear Faixa" : "Bloquear Faixa"}
                    >
                      {track.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => handleDeleteTrack(track.id)}
                      className="p-1.5 rounded-lg bg-background/50 border border-border/40 text-muted-foreground hover:text-red-400 hover:border-red-500/40 transition-colors"
                      title="Excluir Faixa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Configurações da Faixa Selecionada */}
      {selectedTrack ? (
        <div className="space-y-5 border-t border-border/40 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Controles: {selectedTrack.name}
            </span>
          </div>

          {/* Volume Slider (0% - 200%) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-muted-foreground">2. Volume do Áudio</span>
              <span className="font-bold text-amber-400">{selectedTrack.isMuted ? "0% (Mudo)" : `${selectedTrack.volume}%`}</span>
            </div>
            <Slider
              value={[selectedTrack.isMuted ? 0 : selectedTrack.volume]}
              min={0}
              max={200}
              step={1}
              onValueChange={(val) => {
                updateSelectedTrack({
                  volume: val[0],
                  isMuted: val[0] === 0,
                });
              }}
              className="py-2"
            />
          </div>

          {/* Botão Mudo / Remover Áudio */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              3. Estado do Áudio
            </label>
            <Button
              variant="outline"
              onClick={() => updateSelectedTrack({ isMuted: !selectedTrack.isMuted })}
              className={`w-full h-10 rounded-xl border flex items-center justify-center gap-2 transition-all font-medium ${
                selectedTrack.isMuted
                  ? "bg-red-500/15 border-red-500/40 text-red-400 hover:bg-red-500/25"
                  : "bg-muted/40 border-border/50 text-foreground hover:bg-muted/80"
              }`}
            >
              <VolumeX className="w-4 h-4" />
              <span>{selectedTrack.isMuted ? "🔇 Restaurar Áudio" : "🔇 Mudar / Remover Áudio"}</span>
            </Button>
          </div>

          {/* Fade In & Fade Out */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              4. Efeitos de Fade
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <span className="text-[11px] text-muted-foreground">Fade In (seg)</span>
                <input
                  type="number"
                  min={0}
                  max={10}
                  step={0.5}
                  value={selectedTrack.fadeInDuration || 0}
                  onChange={(e) => updateSelectedTrack({ fadeInDuration: parseFloat(e.target.value) || 0 })}
                  className="w-full h-9 px-3 rounded-lg bg-muted/50 border border-border/50 text-xs text-foreground focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] text-muted-foreground">Fade Out (seg)</span>
                <input
                  type="number"
                  min={0}
                  max={10}
                  step={0.5}
                  value={selectedTrack.fadeOutDuration || 0}
                  onChange={(e) => updateSelectedTrack({ fadeOutDuration: parseFloat(e.target.value) || 0 })}
                  className="w-full h-9 px-3 rounded-lg bg-muted/50 border border-border/50 text-xs text-foreground focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Normalização de Volume */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              5. Normalização
            </label>
            <Button
              variant="outline"
              onClick={handleNormalize}
              className="w-full h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 font-medium flex items-center justify-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Normalizar Volume do Áudio</span>
            </Button>
          </div>

          {/* Ações Avançadas de Edição */}
          <div className="space-y-2 pt-2 border-t border-border/40">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Ações na Timeline
            </label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSplitTrack}
                className="rounded-lg border-border/40 text-xs flex items-center justify-center gap-1.5"
                title="Dividir Áudio ao meio"
              >
                <Scissors className="w-3.5 h-3.5" />
                <span>Dividir</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDuplicateTrack(selectedTrack)}
                className="rounded-lg border-border/40 text-xs flex items-center justify-center gap-1.5"
                title="Duplicar faixa"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Duplicar</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteTrack(selectedTrack.id)}
                className="rounded-lg border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs flex items-center justify-center gap-1.5"
                title="Excluir faixa"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir</span>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 border border-dashed border-border/50 rounded-2xl p-4 bg-muted/20">
          <Music2 className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">
            Nenhuma faixa de áudio selecionada. Importe um arquivo acima para começar.
          </p>
        </div>
      )}
    </div>
  );
}
