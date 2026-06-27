
"use client";

import Image from 'next/image';
import { cn } from "@/lib/utils";
import type { ProfileData } from "@/hooks/use-profile";
import { AssinaturaPerfil } from "../modelos/assinatura-perfil";
import { ModeloPadrao } from '../modelos/modelo-padrao';
import { ModeloTwitter } from '../modelos/modelo-twitter'; // Importa o novo modelo
import type { EditorState, EstiloTexto } from '../tipos';
import React, { useState } from 'react';

interface PreviewCanvaProps {
    editorState: EditorState;
    profile: ProfileData;
    baseTextStyle: EstiloTexto;
    textEffectsStyle: EstiloTexto;
    dropShadowStyle: EstiloTexto;
    scale: number;
    containerRef: React.RefObject<HTMLDivElement>;
    updateState: (newState: Partial<EditorState>) => void;
    onTextChange: (text: string) => void;
}


// Função para converter cor hexadecimal para RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
      }
      : null;
}

const getMediaType = (src: string): "image" | "video" | "unknown" => {
  if (!src) return "unknown";
  if (src.startsWith("data:")) {
    if (src.startsWith("data:image")) return "image";
    if (src.startsWith("data:video")) return "video";
  }
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
  const videoExtensions = [".mp4", ".webm", ".ogg"];
  if (imageExtensions.some((ext) => src.toLowerCase().includes(ext))) return "image";
  if (videoExtensions.some((ext) => src.toLowerCase().includes(ext))) return "video";
  if (src.includes("picsum.photos")) return "image";
  return "unknown";
};


export function PreviewCanva(props: PreviewCanvaProps) {
    const { 
        editorState,
        scale,
        containerRef,
        updateState,
    } = props;
    const { activeTemplateId, aspectRatio, backgroundStyle, filmColor, filmOpacity } = editorState;
    const [isTextSelected, setIsTextSelected] = useState(false);
  
  const filmRgb = hexToRgb(filmColor);
  const filmBackgroundColor = filmRgb ? `rgba(${filmRgb.r}, ${filmRgb.g}, ${filmRgb.b}, ${filmOpacity / 100})` : `rgba(0, 0, 0, ${filmOpacity / 100})`;

  const renderBackground = () => {
    if (!backgroundStyle) return <div className="absolute inset-0 bg-black" />;

    const { type, value } = backgroundStyle;
    if (type === "media" && value) {
      const mediaType = getMediaType(value);
      if (mediaType === "image") {
        return <Image src={value} alt="Background" fill className="object-cover" key={value} priority />;
      }
      if (mediaType === "video") {
        return <video src={value} autoPlay loop muted className="absolute inset-0 w-full h-full object-cover" key={value} />;
      }
    } else if (type === "solid") {
      return <div className="absolute inset-0" style={{ backgroundColor: value }} />;
    } else if (type === "gradient") {
      return <div className="absolute inset-0" style={{ background: value }} />;
    }
    return <div className="absolute inset-0 bg-black" />;
  };

  const handleTextBoxResize = (next: { widthPct: number; heightPx: number; fontSize?: number }) => {
    const update: Partial<EditorState> = {
      textBoxWidth: next.widthPct,
      textBoxHeight: next.heightPx,
    };

    if (next.fontSize !== undefined) {
      update.fontSize = next.fontSize;
    }

    updateState(update);
  };

  const renderContent = () => {
    const { profile, baseTextStyle, textEffectsStyle, dropShadowStyle, onTextChange } = props;
    
    const modeloProps = {
      editorState,
      baseTextStyle,
      textEffectsStyle,
      dropShadowStyle,
      profile,
      isTextSelected,
      setIsTextSelected,
      onTextBoxResize: handleTextBoxResize,
      onTextChange,
    };
    
    // Lógica para escolher qual modelo renderizar
    if (activeTemplateId === 'template-twitter') {
        return <ModeloTwitter {...modeloProps} />;
    }
    
    // Modelo padrão para todos os outros casos
    return <ModeloPadrao {...modeloProps} />;
  };

  return (
    <main className="w-full h-full p-4 flex items-start justify-center overflow-hidden">
      <div 
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top center",
        }}
        className="transition-transform duration-300 ease-in-out"
      >
        <div
          ref={containerRef}
          id="editor-preview-content"
          className={cn(
            "relative shadow-2xl rounded-xl overflow-hidden",
            aspectRatio?.replace(/\s/g, "") === '9/16' ? 'w-[340px]' : 'w-[400px]',
            {
              "aspect-square": aspectRatio?.replace(/\s/g, "") === "1/1",
              "aspect-[9/16]": aspectRatio?.replace(/\s/g, "") === "9/16",
              "aspect-[16/9]": aspectRatio?.replace(/\s/g, "") === "16/9",
            }
          )}
        >
            {renderBackground()}

            {filmOpacity > 0 && 
                <div className="absolute inset-0 z-10" style={{ backgroundColor: filmBackgroundColor }} />
            }
            <div className="relative z-20 h-full w-full" onPointerDown={() => setIsTextSelected(false)}>
                {renderContent()}
            </div>
        </div>
      </div>
    </main>
  );
}
