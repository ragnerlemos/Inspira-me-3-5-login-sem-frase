
"use client";

import Image from 'next/image';
import { cn } from "@/lib/utils";
import type { ProfileData } from "@/hooks/use-profile";
import { AssinaturaPerfil } from "../modelos/assinatura-perfil";
import { ModeloPadrao } from '../modelos/modelo-padrao';
import { ModeloTwitter } from '../modelos/modelo-twitter'; // Importa o novo modelo
import type { EditorState, EstiloTexto } from '../tipos';
import React, { useState, useEffect, useRef } from 'react';

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
    isBatchMode?: boolean;
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
        isBatchMode = false,
    } = props;
    const { activeTemplateId, aspectRatio, backgroundStyle, filmColor, filmOpacity } = editorState;
    const [isTextSelected, setIsTextSelected] = useState(false);
    
    // Auto-scale state for batch mode
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [autoScale, setAutoScale] = useState(1);

    useEffect(() => {
      if (!isBatchMode) return;
      const el = wrapperRef.current;
      if (!el) return;

      const observer = new ResizeObserver((entries) => {
        if (!entries || entries.length === 0) return;
        const { width, height } = entries[0].contentRect;
        
        let canvasW = 400;
        let canvasH = 400;
        const ratioStr = (aspectRatio || "9/16").replace(/\s/g, "");
        if (ratioStr === "9/16") {
          canvasW = 340;
          canvasH = 604.4;
        } else if (ratioStr === "16/9") {
          canvasW = 400;
          canvasH = 225;
        } else {
          canvasW = 400;
          canvasH = 400;
        }

        // Add safety margins/padding (e.g. 24px)
        const padding = 24;
        const availableW = Math.max(0, width - padding);
        const availableH = Math.max(0, height - padding);

        const scaleX = availableW / canvasW;
        const scaleY = availableH / canvasH;
        const calculatedScale = Math.min(scaleX, scaleY);
        
        setAutoScale(Math.min(Math.max(calculatedScale, 0.05), 1.5));
      });

      observer.observe(el);
      return () => observer.disconnect();
    }, [aspectRatio, isBatchMode]);
  
  const filmRgb = hexToRgb(filmColor);
  const filmBackgroundColor = filmRgb ? `rgba(${filmRgb.r}, ${filmRgb.g}, ${filmRgb.b}, ${filmOpacity / 100})` : `rgba(0, 0, 0, ${filmOpacity / 100})`;

  const renderBackground = () => {
    if (!backgroundStyle) return <div className="absolute inset-0 bg-black" />;

    const { type, value, blur, brightness, contrast, grayscale, sepia, hueRotate } = backgroundStyle;
    
    const filterStyle = {
      filter: [
        blur ? `blur(${blur}px)` : '',
        brightness !== undefined ? `brightness(${brightness}%)` : '',
        contrast !== undefined ? `contrast(${contrast}%)` : '',
        grayscale ? `grayscale(${grayscale}%)` : '',
        sepia ? `sepia(${sepia}%)` : '',
        hueRotate ? `hue-rotate(${hueRotate}deg)` : '',
      ].filter(Boolean).join(' ')
    };

    if (type === "media" && value) {
      const mediaType = getMediaType(value);
      if (mediaType === "image") {
        return (
          <div className="absolute inset-0 overflow-hidden" style={filterStyle}>
            <Image src={value} alt="Background" fill className="object-cover" key={value} priority />
          </div>
        );
      }
      if (mediaType === "video") {
        return (
          <div className="absolute inset-0 overflow-hidden" style={filterStyle}>
            <video src={value} autoPlay loop muted className="absolute inset-0 w-full h-full object-cover" key={value} />
          </div>
        );
      }
    } else if (type === "solid") {
      return <div className="absolute inset-0" style={{ backgroundColor: value, ...filterStyle }} />;
    } else if (type === "gradient") {
      return <div className="absolute inset-0" style={{ background: value, ...filterStyle }} />;
    }
    return <div className="absolute inset-0 bg-black" />;
  };

  const renderVignette = () => {
    const { vignette } = editorState;
    if (!vignette || !vignette.enabled) return null;

    const hexToRgba = (hex: string, alpha: number) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})`
            : `rgba(0,0,0,${alpha})`;
    };

    const { type, color, opacity, intensity, feather } = vignette;

    const colorStart = hexToRgba(color, opacity);
    const colorEnd = hexToRgba(color, 0);

    const startPct = Math.max(0, intensity * 100 - feather * 100);
    const endPct = Math.min(100, intensity * 100 + feather * 100);
    
    let background = "";
    if (type === 'corners') {
        background = [
            `radial-gradient(circle at top left, ${colorStart} 0%, ${colorEnd} ${endPct}%)`,
            `radial-gradient(circle at top right, ${colorStart} 0%, ${colorEnd} ${endPct}%)`,
            `radial-gradient(circle at bottom left, ${colorStart} 0%, ${colorEnd} ${endPct}%)`,
            `radial-gradient(circle at bottom right, ${colorStart} 0%, ${colorEnd} ${endPct}%)`,
        ].join(', ');
    } else {
        const dirMap: Record<string, string> = {
            bottom: 'to top',
            top: 'to bottom',
            left: 'to right',
            right: 'to left'
        };
        const direction = dirMap[type] || 'to top';
        background = `linear-gradient(${direction}, ${colorStart} 0%, ${colorStart} ${startPct}%, ${colorEnd} ${endPct}%)`;
    }

    return <div className="absolute inset-0 pointer-events-none z-[15]" style={{ background }} />;
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
    <main 
      ref={wrapperRef}
      className={cn(
        "w-full h-full p-4 flex justify-center overflow-hidden",
        isBatchMode ? "items-center bg-black/10" : "items-start"
      )}
    >
      <div 
        style={{
          transform: `scale(${isBatchMode ? autoScale : scale})`,
          transformOrigin: isBatchMode ? "center center" : "top center",
        }}
        className={cn(
          "transition-transform ease-out shrink-0",
          isBatchMode ? "duration-100" : "duration-300 ease-in-out"
        )}
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
            {renderVignette()}

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
