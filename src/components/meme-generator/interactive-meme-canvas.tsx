"use client";

import React, { useRef, useEffect } from 'react';
import { ModeloTwitter } from '@/app/editor-de-video/modelos/modelo-twitter';
import { ModeloPadrao } from '@/app/editor-de-video/modelos/modelo-padrao';
import { EditorState, Perfil, EstiloTexto } from '@/types/editor';
import { InstagramFontSlider } from './instagram-font-slider';
import Image from 'next/image';

interface InteractiveMemeCanvasProps {
    editorState: EditorState;
    profile: Perfil;
    baseTextStyle: EstiloTexto;
    fontSizeMultiplier: number;
    onFontSizeChange: (size: number) => void;
    textBoxWidth: number;
    onTextBoxWidthChange: (widthPct: number) => void;
    textMarginLeft?: number;
    textMarginRight?: number;
    onMarginsChange?: (margins: { marginLeft?: number; marginRight?: number; width: number }) => void;
    onTextChange?: (text: string) => void;
    exportRef: React.RefObject<HTMLDivElement | null>;
}

export function InteractiveMemeCanvas({
    editorState,
    profile,
    baseTextStyle,
    fontSizeMultiplier,
    onFontSizeChange,
    textBoxWidth,
    onTextBoxWidthChange,
    textMarginLeft,
    textMarginRight,
    onMarginsChange,
    onTextChange,
    exportRef,
}: InteractiveMemeCanvasProps) {
    const isTextSelected = true;

    const handleTextBoxResize = ({ 
        widthPct, 
        marginLeftPct, 
        marginRightPct, 
        fontSize 
    }: { 
        widthPct: number; 
        heightPx: number; 
        marginLeftPct?: number; 
        marginRightPct?: number; 
        fontSize?: number;
        lineHeight?: number;
    }) => {
        if (widthPct) {
            onTextBoxWidthChange(Math.round(widthPct));
        }
        if (onMarginsChange && (marginLeftPct !== undefined || marginRightPct !== undefined)) {
            onMarginsChange({
                marginLeft: marginLeftPct !== undefined ? Math.round(marginLeftPct * 10) / 10 : undefined,
                marginRight: marginRightPct !== undefined ? Math.round(marginRightPct * 10) / 10 : undefined,
                width: Math.round(widthPct),
            });
        }
        if (fontSize !== undefined && fontSize > 0) {
            const baseSize = editorState.fontSize || 2;
            const newMultiplier = Math.max(0.5, Math.min(2.5, fontSize / (baseSize || 1)));
            onFontSizeChange(Number(newMultiplier.toFixed(2)));
        }
    };

    const currentEditorState: EditorState = {
        ...editorState,
        fontSize: (editorState.fontSize || 2) * fontSizeMultiplier,
        textBoxWidth: textBoxWidth,
        textMarginLeft: textMarginLeft ?? editorState.textMarginLeft,
        textMarginRight: textMarginRight ?? editorState.textMarginRight,
    };

    const currentBaseTextStyle: EstiloTexto = {
        ...baseTextStyle,
        fontSize: `${currentEditorState.fontSize}cqw`,
    };

    const modeloProps = {
        editorState: currentEditorState,
        profile,
        baseTextStyle: currentBaseTextStyle,
        textEffectsStyle: {},
        dropShadowStyle: {},
        isTextSelected,
        setIsTextSelected: () => {},
        onTextBoxResize: handleTextBoxResize,
        onTextChange: onTextChange || (() => {}),
    };

    const {
        backgroundType,
        backgroundColor,
        gradientStart,
        gradientEnd,
        gradientDirection,
        backgroundImage,
        backgroundOpacity,
        backgroundBlur,
        filmColor = '#000000',
        filmOpacity = 0,
        vignette = { type: 'corners', color: '#000000', opacity: 0, intensity: 0.5, feather: 0.5 },
    } = editorState;

    const renderBackground = () => {
        let bgStyle: React.CSSProperties = {};
        if (backgroundType === 'color') {
            bgStyle.backgroundColor = backgroundColor;
        } else if (backgroundType === 'gradient') {
            bgStyle.backgroundImage = `linear-gradient(${gradientDirection}, ${gradientStart}, ${gradientEnd})`;
        } else if (backgroundType === 'image' && backgroundImage) {
            return (
                <div className="absolute inset-0 overflow-hidden">
                    <Image
                        src={backgroundImage}
                        alt="Background"
                        fill
                        className="object-cover"
                        style={{
                            opacity: (backgroundOpacity ?? 100) / 100,
                            filter: backgroundBlur ? `blur(${backgroundBlur}px)` : 'none',
                        }}
                        unoptimized
                        referrerPolicy="no-referrer"
                    />
                </div>
            );
        }
        return <div className="absolute inset-0" style={bgStyle} />;
    };

    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    };

    const filmRgb = hexToRgb(filmColor);
    const filmBackgroundColor = filmRgb ? `rgba(${filmRgb.r}, ${filmRgb.g}, ${filmRgb.b}, ${filmOpacity / 100})` : `rgba(0, 0, 0, ${filmOpacity / 100})`;

    return (
        <div className="w-full flex flex-col items-center gap-2">
            <p className="text-white text-md font-semibold text-center leading-tight">Visualizar e Ajustar</p>

            <div className="relative flex items-center justify-center gap-3 w-full my-1">
                {/* Canvas Real Interativo 9:16 com o ResizableTextBox acoplado nativamente */}
                <div 
                    className="relative max-w-[70vw] sm:max-w-[300px] max-h-[50vh] w-full aspect-[9/16] rounded-xl shadow-2xl overflow-hidden cursor-default select-none @container"
                >
                    <div 
                        ref={exportRef}
                        className="relative w-full h-full flex flex-col justify-center bg-black select-none"
                    >
                        {renderBackground()}

                        {editorState.showFilm && (
                            <div className="absolute inset-0 pointer-events-none z-[10]" style={{ backgroundColor: filmBackgroundColor }} />
                        )}

                        {editorState.activeTemplateId === 'template-twitter' ? (
                            <ModeloTwitter {...modeloProps} />
                        ) : (
                            <ModeloPadrao {...modeloProps} />
                        )}
                    </div>
                </div>

                {/* Barra de Ajuste de Tamanho de Fonte Estilo Instagram (Funil) */}
                <div className="flex flex-col items-center justify-center shrink-0">
                    <InstagramFontSlider
                        value={fontSizeMultiplier}
                        min={0.5}
                        max={2.5}
                        onChange={onFontSizeChange}
                    />
                </div>
            </div>
        </div>
    );
}
