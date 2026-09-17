"use client";

import React from 'react';
import Image from 'next/image';
import { ModeloTwitter } from '@/app/editor-de-video/modelos/modelo-twitter';
import { ModeloPadrao } from '@/app/editor-de-video/modelos/modelo-padrao';
import type { EditorState, EstiloTexto } from '@/app/editor-de-video/tipos';
import { useProfile } from '@/hooks/use-profile';

interface MemeHiddenRendererProps {
    memeRef: React.RefObject<HTMLDivElement | null>;
    editorState: EditorState;
    profile: ReturnType<typeof useProfile>['profile'];
    baseTextStyle: EstiloTexto;
    isTextSelected: boolean;
    setIsTextSelected: (selected: boolean) => void;
}

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

export function MemeHiddenRenderer({
    memeRef,
    editorState,
    profile,
    baseTextStyle,
    isTextSelected,
    setIsTextSelected
}: MemeHiddenRendererProps) {
    const { backgroundStyle, filmColor, filmOpacity } = editorState;

    const handleTextBoxResize = () => {};
    const handleTextChange = () => {};

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

    const filmRgb = hexToRgb(filmColor);
    const filmBackgroundColor = filmRgb ? `rgba(${filmRgb.r}, ${filmRgb.g}, ${filmRgb.b}, ${filmOpacity / 100})` : `rgba(0, 0, 0, ${filmOpacity / 100})`;

    const modeloProps = {
        editorState: {
            ...editorState,
            text: editorState.text,
            textBoxWidth: editorState.textBoxWidth,
        },
        profile,
        baseTextStyle,
        textEffectsStyle: {},
        dropShadowStyle: {},
        isTextSelected,
        setIsTextSelected,
        onTextBoxResize: handleTextBoxResize,
        onTextChange: handleTextChange,
    };

    return (
        <div className="fixed top-[-9999px] left-[-9999px]">
            <div 
                ref={memeRef} 
                className="relative overflow-hidden flex flex-col justify-center bg-black"
                style={{ width: '340px', aspectRatio: editorState.aspectRatio?.replace(/\s/g, '') || '9/16' }}
            >
                {renderBackground()}
                
                {editorState.showFilm && (
                  <div className="absolute inset-0 pointer-events-none z-[10]" style={{ backgroundColor: filmBackgroundColor }} />
                )}
                
                {renderVignette()}

                {editorState.activeTemplateId === 'template-padrao' || editorState.activeTemplateId === 'template-default' || editorState.activeTemplateId === 'template-mountain' ? (
                    <ModeloPadrao {...modeloProps} />
                ) : (
                    <ModeloTwitter {...modeloProps} />
                )}
            </div>
        </div>
    );
}
