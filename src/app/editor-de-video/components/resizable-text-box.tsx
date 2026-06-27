"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface ResizableTextBoxProps {
  widthPct: number;
  heightPx: number;
  fontSize: number;
  isSelected: boolean;
  editable?: boolean;
  text?: string;
  onTextChange?: (next: string) => void;
  onSelect: () => void;
  onResize: (next: { widthPct: number; heightPx: number; fontSize?: number }) => void;
  children: React.ReactNode;
}

type ResizeType = 'width' | 'height' | 'both' | null;
type ResizeDirection = 'nw' | 'ne' | 'sw' | 'se' | 'w' | 'e';

const MIN_WIDTH = 40;
const MAX_WIDTH = 100;
const MIN_HEIGHT = 60;
const MAX_HEIGHT = 700;
const MIN_FONT_SIZE = 0.5;
const MAX_FONT_SIZE = 20;
const FONT_SCALE_SENSITIVITY = 0.002;
const MIN_RESIZE_DELTA = 2;
const FONT_LERP_FACTOR = 0.18;

const isLeftDirection = (direction: ResizeDirection | undefined) => direction === 'nw' || direction === 'sw' || direction === 'w';
const isTopDirection = (direction: ResizeDirection | undefined) => direction === 'nw' || direction === 'ne';

export function ResizableTextBox({ widthPct, heightPx, fontSize, isSelected, editable = false, text, onTextChange, onSelect, onResize, children }: ResizableTextBoxProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const editableRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const pendingPointer = useRef<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);
  const resizeState = useRef<{
    type: ResizeType;
    direction?: ResizeDirection;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    startFontSize: number;
    currentWidth: number;
    currentHeight: number;
    currentFontSize: number;
    parentWidth: number;
  }>({
      type: null,
      startX: 0,
      startY: 0,
      startWidth: widthPct,
      startHeight: heightPx || MIN_HEIGHT,
      startFontSize: fontSize,
      currentWidth: widthPct,
      currentHeight: heightPx || MIN_HEIGHT,
      currentFontSize: fontSize,
      parentWidth: 0,
  });
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    if (isDraggingRef.current) return;
    resizeState.current.startWidth = widthPct;
    resizeState.current.startHeight = heightPx || MIN_HEIGHT;
    resizeState.current.startFontSize = fontSize;
    resizeState.current.currentWidth = widthPct;
    resizeState.current.currentHeight = heightPx || MIN_HEIGHT;
    resizeState.current.currentFontSize = fontSize;
  }, [widthPct, heightPx, fontSize]);

  useEffect(() => {
    if (!editable || !editableRef.current || text === undefined) return;
    if (editableRef.current.textContent !== text) {
      editableRef.current.textContent = text;
    }
  }, [editable, text]);

  const clampWidth = useCallback((value: number) => Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, value)), []);
  const clampHeight = useCallback((value: number) => Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, value)), []);
  const clampFontSize = useCallback((value: number) => Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, value)), []);

  const getDirectionVector = useCallback((direction: ResizeDirection | undefined) => {
    switch (direction) {
      case 'nw': return { x: -1, y: -1 };
      case 'ne': return { x: 1, y: -1 };
      case 'sw': return { x: -1, y: 1 };
      case 'se': return { x: 1, y: 1 };
      case 'w': return { x: -1, y: 0 };
      case 'e': return { x: 1, y: 0 };
      default: return { x: 1, y: 1 };
    }
  }, []);

  const updateResize = useCallback(() => {
    if (!isDraggingRef.current) return; // Só roda enquanto estiver dragando

    const pointer = pendingPointer.current;
    const state = resizeState.current;

    if (!pointer || !wrapperRef.current || !state.type) {
        animationFrameRef.current = window.requestAnimationFrame(updateResize);
        return;
    }

    const { type, direction, startX, startY, startWidth, startHeight, startFontSize, parentWidth } = state;
    
    // 1. DELTA RELATIVO
    const dx = pointer.x - startX;
    const dy = pointer.y - startY;

    let targetWidth = state.currentWidth;
    let targetHeight = state.currentHeight;
    let targetFontSize = state.currentFontSize;

    // 5. ANTI-JITTER (Lidando com os tremeliques do mouse)
    if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
        if (type === 'both') {
            // 2. ESCALA BASEADA NA DIAGONAL (Sensibilidade ultra leve)
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // 3. DIREÇÃO DO MOVIMENTO (Afastar = Cresce, Aproximar = Encolhe)
            const dirVec = getDirectionVector(direction);
            const moveDir = (dx * dirVec.x + dy * dirVec.y) >= 0 ? 1 : -1;
            
            const sensitivity = 0.003;
            let scale = 1 + (distance * sensitivity * moveDir);
            
            // 8. LIMITES GERAIS
            scale = Math.max(0.1, Math.min(scale, 10));

            targetWidth = clampWidth(startWidth * scale);
            targetHeight = clampHeight(startHeight * scale);
            targetFontSize = clampFontSize(startFontSize * scale);

        } else if (type === 'width') {
            const signedX = isLeftDirection(direction) ? -dx : dx;
            const startWidthPx = (startWidth / 100) * parentWidth;
            const newWidthPx = Math.max(40, startWidthPx + signedX);
            targetWidth = clampWidth((newWidthPx / parentWidth) * 100);
            targetHeight = startHeight;
            targetFontSize = startFontSize; // Opcional fixar (pois não injetaremos via prop pra garantir layout)
            
        } else if (type === 'height') {
            const signedY = isTopDirection(direction) ? -dy : dy;
            targetHeight = clampHeight(startHeight + signedY);
            targetWidth = startWidth;
            targetFontSize = startFontSize;
        }
    }

    // 4 E 9. SUAVIZAÇÃO UNIVERSAL (LERP) - Pulos Nunca Mais!
    const lerpSpeed = 0.15;
    state.currentWidth += (targetWidth - state.currentWidth) * lerpSpeed;
    state.currentHeight += (targetHeight - state.currentHeight) * lerpSpeed;
    state.currentFontSize += (targetFontSize - state.currentFontSize) * lerpSpeed;

    // Disparar Re-Render com o Estado Fluído Interpolado
    onResize({ 
       widthPct: state.currentWidth, 
       heightPx: state.currentHeight, 
       fontSize: type === 'both' ? state.currentFontSize : undefined 
    });

    // 6. Loop Infinito Super Suave (game loop engine)
    animationFrameRef.current = window.requestAnimationFrame(updateResize);
  }, [clampWidth, clampHeight, clampFontSize, getDirectionVector, isLeftDirection, isTopDirection, onResize]);

  const handlePointerMove = useCallback((event: PointerEvent) => {
    pendingPointer.current = { x: event.clientX, y: event.clientY };
  }, []);

  const handlePointerUp = useCallback(() => {
    isDraggingRef.current = false;
    setIsResizing(false);
    resizeState.current.type = null;
    pendingPointer.current = null;
    
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
  }, [handlePointerMove]);

  const startResize = useCallback((type: 'width' | 'height' | 'both', direction?: ResizeDirection) => (event: React.PointerEvent<HTMLDivElement>) => {
    event.stopPropagation();
    event.preventDefault();

    if (!wrapperRef.current) return;
    const parentWidth = wrapperRef.current.parentElement?.getBoundingClientRect().width || wrapperRef.current.getBoundingClientRect().width;

    // 7. TRAVAR ESCALA INICIAL
    resizeState.current = {
      type,
      direction,
      startX: event.clientX,
      startY: event.clientY,
      startWidth: widthPct,
      startHeight: heightPx || wrapperRef.current.getBoundingClientRect().height,
      startFontSize: fontSize,
      currentWidth: widthPct,
      currentHeight: heightPx || wrapperRef.current.getBoundingClientRect().height,
      currentFontSize: fontSize,
      parentWidth,
    };

    pendingPointer.current = { x: event.clientX, y: event.clientY };
    isDraggingRef.current = true;
    setIsResizing(true);
    
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    
    // Lança a ignição do nosso Game Loop contínuo!
    if (animationFrameRef.current === null) {
        animationFrameRef.current = window.requestAnimationFrame(updateResize);
    }
  }, [handlePointerMove, handlePointerUp, updateResize, widthPct, heightPx, fontSize]);

  const wrapperStyle: React.CSSProperties = useMemo(() => ({
    width: `${widthPct}%`,
    minHeight: `${MIN_HEIGHT}px`,
    height: heightPx > 0 ? `${heightPx}px` : 'auto',
    maxWidth: '100%',
  }), [widthPct, heightPx]);

  const handleTextInput = (event: React.FormEvent<HTMLDivElement>) => {
    if (!onTextChange) return;
    onTextChange(event.currentTarget.textContent ?? '');
  };

  return (
    <div
      ref={wrapperRef}
      onPointerDown={(event) => {
        event.stopPropagation();
        onSelect();
      }}
      className="relative"
      style={{ ...wrapperStyle, marginLeft: 0 }}
    >
      <div className="relative">
        {editable ? (
          <div
            ref={editableRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleTextInput}
            onClick={(event) => {
              event.stopPropagation();
              onSelect();
            }}
            className="min-h-[1.3em] outline-none"
            style={{ width: '100%', textAlign: 'left', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
          >
            {children}
          </div>
        ) : (
          <div className="relative">
            {children}
          </div>
        )}
      </div>

      {isSelected && (
        <>
          <div className="absolute inset-0 rounded-lg border-2 border-primary pointer-events-none export-ignore" />
          <div
            className="absolute left-0 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/90 bg-primary shadow-sm cursor-nwse-resize export-ignore"
            onPointerDown={startResize('both', 'nw')}
          />
          <div
            className="absolute right-0 top-0 h-3 w-3 translate-x-1/2 -translate-y-1/2 rounded-full border border-white/90 bg-primary shadow-sm cursor-nesw-resize export-ignore"
            onPointerDown={startResize('both', 'ne')}
          />
          <div
            className="absolute left-0 bottom-0 h-3 w-3 -translate-x-1/2 translate-y-1/2 rounded-full border border-white/90 bg-primary shadow-sm cursor-nesw-resize export-ignore"
            onPointerDown={startResize('both', 'sw')}
          />
          <div
            className="absolute right-0 bottom-0 h-3 w-3 translate-x-1/2 translate-y-1/2 rounded-full border border-white/90 bg-primary shadow-sm cursor-nwse-resize export-ignore"
            onPointerDown={startResize('both', 'se')}
          />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 -translate-x-1/2 rounded-full border border-white/90 bg-primary shadow-sm cursor-ew-resize export-ignore"
            onPointerDown={startResize('width', 'w')}
          />
          <div
            className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 translate-x-1/2 rounded-full border border-white/90 bg-primary shadow-sm cursor-ew-resize export-ignore"
            onPointerDown={startResize('width', 'e')}
          />
        </>
      )}
      {isResizing && (
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm pointer-events-none" />
      )}
    </div>
  );
}
