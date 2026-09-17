"use client";

import React, { useRef, useState } from "react";
import { 
  Music, 
  Library, 
  Video, 
  Upload, 
  Sparkles, 
  Clock, 
  FileAudio, 
  CheckCircle2, 
  AlertCircle,
  Play,
  Volume2,
  ListMusic
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useEditor } from "../contexts/editor-context";
import type { AudioTrack } from "../tipos";

export function SidebarMusica() {
  const { currentState, updateState } = useEditor();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"biblioteca" | "extrair">("extrair");

  // Estados de Extração
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractProgress, setExtractProgress] = useState(0);
  const [extractStatus, setExtractStatus] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Extração de Áudio via Web Audio API (AudioContext Offline / MediaElement)
  const processExtractAudio = async (file: File) => {
    setIsExtracting(true);
    setExtractProgress(10);
    setExtractStatus("Lendo arquivo de vídeo...");
    setErrorMessage(null);

    try {
      const fileUrl = URL.createObjectURL(file);
      setExtractProgress(25);
      setExtractStatus("Decodificando trilha de áudio...");

      // Carrega o arquivo em ArrayBuffer para Web Audio API
      const arrayBuffer = await file.arrayBuffer();
      setExtractProgress(50);
      setExtractStatus("Extraindo frequências sonoras...");

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer);

      setExtractProgress(75);
      setExtractStatus("Exportando trilha sem perda de qualidade...");

      // Converte o AudioBuffer decodificado em um WAV Blob limpo
      const wavBlob = audioBufferToWavBlob(decodedBuffer);
      const audioUrl = URL.createObjectURL(wavBlob);
      const duration = Math.round(decodedBuffer.duration * 10) / 10;

      setExtractProgress(100);
      setExtractStatus("Extração concluída com sucesso!");

      const extractedTrack: AudioTrack = {
        id: `extracted_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: `Áudio Extraído - ${file.name.replace(/\.[^/.]+$/, "")}`,
        url: audioUrl,
        type: "extracted",
        volume: 100,
        isMuted: false,
        startTime: 0,
        duration: duration,
        trimStart: 0,
        trimEnd: duration,
        fadeInDuration: 0,
        fadeOutDuration: 0,
      };

      const existingTracks = currentState?.audioTracks || [];
      updateState({ audioTracks: [...existingTracks, extractedTrack] });

      toast({
        title: "Áudio Extraído com Sucesso! 🎼",
        description: `Trilha de ${duration}s adicionada automaticamente à timeline.`,
      });

      audioCtx.close();
    } catch (err: any) {
      console.error("[Extração de Áudio Erro]", err);
      const msg = "Não foi possível extrair a trilha sonora deste vídeo. Certifique-se de que o vídeo possui áudio válido.";
      setErrorMessage(msg);
      toast({
        variant: "destructive",
        title: "Erro na extração",
        description: msg,
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processExtractAudio(file);
    }
    if (e.target) e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("video/")) {
      processExtractAudio(file);
    } else {
      toast({
        variant: "destructive",
        title: "Arquivo Inválido",
        description: "Por favor, arraste um arquivo de vídeo válido.",
      });
    }
  };

  return (
    <div className="p-4 space-y-5 text-foreground">
      {/* Abas do Módulo Música */}
      <div className="grid grid-cols-2 gap-1 p-1 bg-muted/50 rounded-xl border border-border/50">
        <button
          type="button"
          onClick={() => setActiveTab("biblioteca")}
          className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === "biblioteca"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Library className="w-3.5 h-3.5" />
          <span>Biblioteca</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("extrair")}
          className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === "extrair"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          <span>Extrair Áudio</span>
        </button>
      </div>

      {/* ABA 1: BIBLIOTECA (EM BREVE) */}
      {activeTab === "biblioteca" && (
        <div className="space-y-4">
          <div className="p-6 text-center border border-dashed border-border/60 rounded-2xl bg-muted/20 space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto animate-pulse">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-foreground">Biblioteca de Músicas</h3>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-[260px] mx-auto">
              Estrutura pronta para integração com catálogo musical royalty-free.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-semibold">
              <Clock className="w-3 h-3" />
              <span>Recurso Em Breve</span>
            </div>
          </div>

          {/* Placeholders de Categorias */}
          <div className="space-y-2 opacity-60">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Categorias Planejadas
            </p>
            <div className="grid grid-cols-2 gap-2">
              {["🎬 Cinematográfico", "☕ Lofi Chill", "⚡ Vibe Pop", "🧘 Mídia Relax"].map((cat) => (
                <div key={cat} className="p-3 rounded-xl bg-muted/40 border border-border/40 text-xs font-medium text-foreground/80 flex items-center justify-between">
                  <span>{cat}</span>
                  <ListMusic className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: EXTRAIR ÁUDIO DO VÍDEO */}
      {activeTab === "extrair" && (
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span>Extração Automática</span>
              <span className="text-[10px] text-amber-400 font-normal">100% Qualidade Original</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Selecione ou arraste um vídeo para extrair a trilha sonora diretamente para a timeline.
            </p>
          </div>

          <input
            type="file"
            ref={videoInputRef}
            onChange={handleVideoSelect}
            accept="video/*,.mp4,.mov,.webm,.avi,.mkv"
            className="hidden"
          />

          {/* Área de Drag and Drop / Seleção */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => !isExtracting && videoInputRef.current?.click()}
            className={`p-6 border-2 border-dashed rounded-2xl text-center flex flex-col items-center justify-center transition-all ${
              isExtracting
                ? "border-amber-500/50 bg-amber-500/10 cursor-not-allowed"
                : "border-border/60 hover:border-amber-500/50 hover:bg-muted/30 cursor-pointer"
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
              <FileAudio className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-foreground">
              {isExtracting ? "Extraindo Trilha Sonora..." : "Clique ou Arraste o Vídeo Aqui"}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Suporta MP4, MOV, WEBM, AVI, MKV
            </p>
          </div>

          {/* Progresso de Extração */}
          {isExtracting && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  {extractStatus}
                </span>
                <span className="font-bold text-amber-400">{extractProgress}%</span>
              </div>
              <Progress value={extractProgress} className="h-2 bg-amber-950/40" />
            </div>
          )}

          {/* Mensagem de Erro */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Helper utilitário: Converte AudioBuffer para Blob WAV sem perda de qualidade
function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const out = new DataView(new ArrayBuffer(length));
  let channels: Float32Array[] = [];
  let sampleRate = buffer.sampleRate;
  let offset = 0;
  let pos = 0;

  function writeString(str: string) {
    for (let i = 0; i < str.length; i++) {
      out.setUint8(pos++, str.charCodeAt(i));
    }
  }

  function setUint16(data: number) {
    out.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: number) {
    out.setUint32(pos, data, true);
    pos += 4;
  }

  // RIFF header
  writeString("RIFF");
  setUint32(length - 8);
  writeString("WAVE");
  writeString("fmt ");
  setUint32(16);
  setUint16(1); // PCM
  setUint16(numOfChan);
  setUint32(sampleRate);
  setUint32(sampleRate * 2 * numOfChan);
  setUint16(numOfChan * 2);
  setUint16(16); // 16-bit
  writeString("data");
  setUint32(length - pos - 4);

  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (offset < buffer.length) {
    for (let i = 0; i < numOfChan; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      out.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([out.buffer], { type: "audio/wav" });
}
