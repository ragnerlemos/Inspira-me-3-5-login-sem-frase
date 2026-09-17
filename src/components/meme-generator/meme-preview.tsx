"use client";

import React, { useRef } from 'react';
import Image from 'next/image';
import { InstagramFontSlider } from './instagram-font-slider';
import { ModeloTwitter } from '@/app/editor-de-video/modelos/modelo-twitter';
import { ModeloPadrao } from '@/app/editor-de-video/modelos/modelo-padrao';
import { Button } from '@/components/ui/button';
import type { EditorState, EstiloTexto } from '@/app/editor-de-video/tipos';
import { useProfile } from '@/hooks/use-profile';

interface MemePreviewProps {
    previewContainerRef?: React.RefObject<HTMLDivElement | null>;
    memeUrl?: string | null;
    onDownload: () => void;
    editorState: EditorState;
    profile: ReturnType<typeof useProfile>['profile'];
    baseTextStyle: EstiloTexto;
    isTextSelected: boolean;
    setIsTextSelected: (selected: boolean) => void;
    onTextBoxResize: (next: { 
        widthPct: number; 
        heightPx: number; 
        marginLeftPct?: number; 
        marginRightPct?: number; 
        fontSize?: number; 
        lineHeight?: number 
    }) => void;
    text: string;
    onTextChange: (text: string) => void;
    fontSizeMultiplier: number;
    onFontSizeChange: (size: number) => void;
    textBoxWidth: number;
    onTextBoxWidthChange: (widthPct: number) => void;
    onToggleBold?: () => void;
    onToggleItalic?: () => void;
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

export function MemePreview({ 
    previewContainerRef,
    memeUrl, 
    onDownload,
    editorState,
    profile,
    baseTextStyle,
    isTextSelected,
    setIsTextSelected,
    onTextBoxResize,
    text,
    onTextChange,
    fontSizeMultiplier = 1,
    onFontSizeChange,
    textBoxWidth = 80,
    onTextBoxWidthChange,
    onToggleBold,
    onToggleItalic,
}: MemePreviewProps) {
    const internalContainerRef = useRef<HTMLDivElement>(null);
    const containerRef = previewContainerRef || internalContainerRef;
    const { backgroundStyle, filmColor, filmOpacity } = editorState;

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
            text,
            textBoxWidth,
        },
        profile,
        baseTextStyle,
        textEffectsStyle: {},
        dropShadowStyle: {},
        isTextSelected,
        setIsTextSelected,
        onTextBoxResize,
        onTextChange,
    };

    return (
        <div className="w-full flex flex-col items-center gap-2">
            <p className="text-white text-md font-semibold text-center leading-tight">Visualizar Imagem</p>

            <div className="relative flex items-center justify-center gap-3 w-full my-1">
                {/* Container Interativo do Modelo com as Alças de Edição */}
                <div 
                    ref={containerRef}
                    id="meme-preview-image-container"
                    className="relative max-w-[85vw] sm:max-w-[340px] w-full aspect-[9/16] rounded-xl shadow-2xl overflow-hidden cursor-default select-none bg-black flex flex-col justify-center" 
                    onPointerDown={() => setIsTextSelected(false)}
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

                {/* Barra de Ajuste de Estilo */}
                {onFontSizeChange && (
                    <div className="flex flex-col items-center justify-center shrink-0 gap-3">
                         <div className="flex flex-col gap-2">
                             <Button variant={baseTextStyle.fontWeight === 'bold' || baseTextStyle.fontWeight === '700' ? "default" : "secondary"} size="icon" className="h-9 w-9 rounded-full" onClick={onToggleBold}>
                                <span className="font-bold">B</span>
                             </Button>
                             <Button variant={baseTextStyle.fontStyle === 'italic' ? "default" : "secondary"} size="icon" className="h-9 w-9 rounded-full" onClick={onToggleItalic}>
                                <span className="italic">I</span>
                             </Button>
                        </div>
                        <InstagramFontSlider
                            value={fontSizeMultiplier}
                            min={0.5}
                            max={2.2}
                            onChange={onFontSizeChange}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}



