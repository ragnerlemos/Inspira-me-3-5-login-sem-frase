"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface ResizableTextBoxProps {
  widthPct: number;
  heightPx: number;
  marginLeftPct?: number;
  marginRightPct?: number;
  fontSize: number;
  lineHeight?: number;
  align?: 'left' | 'center';
  isSelected: boolean;
  editable?: boolean;
  text?: string;
  onTextChange?: (next: string) => void;
  onSelect: () => void;
  onResize: (next: { 
    widthPct: number; 
    heightPx: number; 
    marginLeftPct?: number;
    marginRightPct?: number;
    fontSize?: number; 
    lineHeight?: number 
  }) => void;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

type ResizeType = 'width' | 'height' | 'both' | 'lineHeight' | null;
type ResizeDirection = 'nw' | 'ne' | 'sw' | 'se' | 'w' | 'e' | 'n' | 's';

const MIN_WIDTH = 20;
const MAX_WIDTH = 100;
const MIN_HEIGHT = 40;
const MAX_HEIGHT = 900;
const MIN_FONT_SIZE = 0.5;
const MAX_FONT_SIZE = 20;
const MIN_LINE_HEIGHT = 0.85;
const MAX_LINE_HEIGHT = 2.6;

const isLeftDirection = (direction: ResizeDirection | undefined) => direction === 'nw' || direction === 'sw' || direction === 'w';
const isTopDirection = (direction: ResizeDirection | undefined) => direction === 'nw' || direction === 'ne' || direction === 'n';

// ... (existing imports)

export function ResizableTextBox({
  widthPct,
  heightPx,
  marginLeftPct,
  marginRightPct,
  fontSize,
  lineHeight = 1.3,
  align = 'center',
  isSelected,
  editable = false,
  text,
  onTextChange,
  onSelect,
  onResize,
  style,
  children,
  onMoveVertical
}: ResizableTextBoxProps) {
  // ... (existing refs)
  
  const wrapperRef = useRef<HTMLDivElement>(null);
  const editableRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const pendingPointer = useRef<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);
  const [top, setTop] = useState(0); 
  const moveState = useRef({ startY: 0 });

  const handleMove = useCallback((event: PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dy = event.clientY - moveState.current.startY;
    setTop(prev => prev + dy);
    moveState.current.startY = event.clientY;
  }, []);

  const stopMove = useCallback(() => {
    isDraggingRef.current = false;
    window.removeEventListener('pointermove', handleMove);
    window.removeEventListener('pointerup', stopMove);
  }, [handleMove]);

  const startMove = useCallback((event: React.PointerEvent) => {
    event.stopPropagation();
    isDraggingRef.current = true;
    moveState.current.startY = event.clientY;
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', stopMove);
  }, [handleMove, stopMove]);



  const defaultMarginLeft = align === 'left' ? 0 : Math.max(0, (100 - widthPct) / 2);
  const defaultMarginRight = align === 'left' ? Math.max(0, 100 - widthPct) : Math.max(0, (100 - widthPct) / 2);
  const initialMarginLeft = marginLeftPct !== undefined ? marginLeftPct : defaultMarginLeft;
  const initialMarginRight = marginRightPct !== undefined ? marginRightPct : defaultMarginRight;

  const resizeState = useRef<{
    type: ResizeType;
    direction?: ResizeDirection;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    startMarginLeft: number;
    startMarginRight: number;
    startFontSize: number;
    startLineHeight: number;
    currentWidth: number;
    currentHeight: number;
    currentMarginLeft: number;
    currentMarginRight: number;
    currentFontSize: number;
    currentLineHeight: number;
    parentWidth: number;
  }>({
      type: null,
      startX: 0,
      startY: 0,
      startWidth: widthPct,
      startHeight: heightPx || MIN_HEIGHT,
      startMarginLeft: initialMarginLeft,
      startMarginRight: initialMarginRight,
      startFontSize: fontSize,
      startLineHeight: lineHeight,
      currentWidth: widthPct,
      currentHeight: heightPx || MIN_HEIGHT,
      currentMarginLeft: initialMarginLeft,
      currentMarginRight: initialMarginRight,
      currentFontSize: fontSize,
      currentLineHeight: lineHeight,
      parentWidth: 0,
  });
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    if (isDraggingRef.current) return;
    resizeState.current.startWidth = widthPct;
    resizeState.current.startHeight = heightPx || MIN_HEIGHT;
    resizeState.current.startMarginLeft = initialMarginLeft;
    resizeState.current.startMarginRight = initialMarginRight;
    resizeState.current.startFontSize = fontSize;
    resizeState.current.startLineHeight = lineHeight;
    resizeState.current.currentWidth = widthPct;
    resizeState.current.currentHeight = heightPx || MIN_HEIGHT;
    resizeState.current.currentMarginLeft = initialMarginLeft;
    resizeState.current.currentMarginRight = initialMarginRight;
    resizeState.current.currentFontSize = fontSize;
    resizeState.current.currentLineHeight = lineHeight;
  }, [widthPct, heightPx, fontSize, lineHeight, initialMarginLeft, initialMarginRight]);

  useEffect(() => {
    if (!editable || !editableRef.current || text === undefined) return;
    if (editableRef.current.textContent !== text) {
      editableRef.current.textContent = text;
    }
  }, [editable, text]);

  const clampWidth = useCallback((value: number) => Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, value)), []);
  const clampHeight = useCallback((value: number) => Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, value)), []);
  const clampFontSize = useCallback((value: number) => Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, value)), []);
  const clampLineHeight = useCallback((value: number) => Math.min(MAX_LINE_HEIGHT, Math.max(MIN_LINE_HEIGHT, value)), []);

  const getDirectionVector = useCallback((direction: ResizeDirection | undefined) => {
    switch (direction) {
      case 'nw': return { x: -1, y: -1 };
      case 'ne': return { x: 1, y: -1 };
      case 'sw': return { x: -1, y: 1 };
      case 'se': return { x: 1, y: 1 };
      case 'w': return { x: -1, y: 0 };
      case 'e': return { x: 1, y: 0 };
      case 'n': return { x: 0, y: -1 };
      case 's': return { x: 0, y: 1 };
      default: return { x: 1, y: 1 };
    }
  }, []);

  const updateResize = useCallback(() => {
    if (!isDraggingRef.current) return;

    const pointer = pendingPointer.current;
    const state = resizeState.current;

    if (!pointer || !wrapperRef.current || !state.type) {
        animationFrameRef.current = window.requestAnimationFrame(updateResize);
        return;
    }

    const { 
      type, 
      direction, 
      startX, 
      startY, 
      startWidth, 
      startHeight, 
      startMarginLeft, 
      startMarginRight, 
      startFontSize, 
      startLineHeight, 
      parentWidth 
    } = state;
    
    const dx = pointer.x - startX;
    const dy = pointer.y - startY;

    let targetWidth = state.currentWidth;
    let targetHeight = state.currentHeight;
    let targetMarginLeft = state.currentMarginLeft;
    let targetMarginRight = state.currentMarginRight;
    let targetFontSize = state.currentFontSize;
    let targetLineHeight = state.currentLineHeight;

    if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
        if (type === 'both') {
            const distance = Math.sqrt(dx * dx + dy * dy);
            const dirVec = getDirectionVector(direction);
            const moveDir = (dx * dirVec.x + dy * dirVec.y) >= 0 ? 1 : -1;
            
            const sensitivity = 0.003;
            let scale = 1 + (distance * sensitivity * moveDir);
            scale = Math.max(0.1, Math.min(scale, 10));

            targetWidth = clampWidth(startWidth * scale);
            targetHeight = clampHeight(startHeight * scale);
            targetFontSize = clampFontSize(startFontSize * scale);

            const remaining = Math.max(0, 100 - targetWidth);
            const startRemaining = Math.max(0.001, 100 - startWidth);
            const ratio = remaining / startRemaining;
            targetMarginLeft = Math.max(0, startMarginLeft * ratio);
            targetMarginRight = Math.max(0, remaining - targetMarginLeft);

        } else if (type === 'width') {
            const safeParentWidth = parentWidth || 400;
            const deltaPct = (dx / safeParentWidth) * 100;

            if (direction === 'e') {
                // Alça DIREITA: o lado esquerdo fica 100% TRAVADO!
                targetMarginLeft = startMarginLeft;
                const maxAllowedMarginRight = Math.max(0, 100 - startMarginLeft - MIN_WIDTH);
                targetMarginRight = Math.max(0, Math.min(maxAllowedMarginRight, startMarginRight - deltaPct));
                targetWidth = Math.max(MIN_WIDTH, 100 - targetMarginLeft - targetMarginRight);
                targetFontSize = startFontSize;

            } else if (direction === 'w') {
                // Alça ESQUERDA: o lado direito fica 100% TRAVADO!
                targetMarginRight = startMarginRight;
                const maxAllowedMarginLeft = Math.max(0, 100 - startMarginRight - MIN_WIDTH);
                targetMarginLeft = Math.max(0, Math.min(maxAllowedMarginLeft, startMarginLeft + deltaPct));
                targetWidth = Math.max(MIN_WIDTH, 100 - targetMarginLeft - targetMarginRight);
                targetFontSize = startFontSize;
            }

        } else if (type === 'lineHeight') {
            // Alças horizontais superior/inferior: arrastar para afastar aumenta o espaçamento entre linhas,
            // arrastar para dentro diminui até o limite legível (MIN_LINE_HEIGHT: 0.85 a MAX: 2.6)
            const signedY = isTopDirection(direction) ? -dy : dy;
            const deltaLineHeight = (signedY * 0.012);
            targetLineHeight = clampLineHeight(startLineHeight + deltaLineHeight);
            targetWidth = startWidth;
            targetFontSize = startFontSize;
            if (startHeight === 0 || heightPx === 0) {
              targetHeight = 0;
            }

        } else if (type === 'height') {
            const signedY = isTopDirection(direction) ? -dy : dy;
            targetHeight = clampHeight(startHeight + signedY);
            targetWidth = startWidth;
            targetFontSize = startFontSize;
        }
    }

    state.currentWidth = targetWidth;
    state.currentHeight = targetHeight;
    state.currentMarginLeft = targetMarginLeft;
    state.currentMarginRight = targetMarginRight;
    state.currentFontSize = targetFontSize;
    state.currentLineHeight = targetLineHeight;

    onResize({ 
       widthPct: Number(state.currentWidth.toFixed(2)), 
       marginLeftPct: Number(state.currentMarginLeft.toFixed(2)),
       marginRightPct: Number(state.currentMarginRight.toFixed(2)),
       heightPx: (type === 'lineHeight' && heightPx === 0) ? 0 : state.currentHeight, 
       fontSize: type === 'both' ? state.currentFontSize : undefined,
       lineHeight: type === 'lineHeight' ? Number(state.currentLineHeight.toFixed(2)) : undefined,
    });

    animationFrameRef.current = window.requestAnimationFrame(updateResize);
  }, [clampWidth, clampHeight, clampFontSize, clampLineHeight, getDirectionVector, onResize, heightPx]);

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

  const startResize = useCallback((type: ResizeType, direction?: ResizeDirection) => (event: React.PointerEvent<HTMLDivElement>) => {
    event.stopPropagation();
    event.preventDefault();

    if (!wrapperRef.current) return;
    const parentWidth = wrapperRef.current.parentElement?.getBoundingClientRect().width || wrapperRef.current.getBoundingClientRect().width || 400;

    resizeState.current = {
      type,
      direction,
      startX: event.clientX,
      startY: event.clientY,
      startWidth: widthPct,
      startHeight: heightPx || wrapperRef.current.getBoundingClientRect().height,
      startMarginLeft: initialMarginLeft,
      startMarginRight: initialMarginRight,
      startFontSize: fontSize,
      startLineHeight: lineHeight,
      currentWidth: widthPct,
      currentHeight: heightPx || wrapperRef.current.getBoundingClientRect().height,
      currentMarginLeft: initialMarginLeft,
      currentMarginRight: initialMarginRight,
      currentFontSize: fontSize,
      currentLineHeight: lineHeight,
      parentWidth,
    };

    pendingPointer.current = { x: event.clientX, y: event.clientY };
    isDraggingRef.current = true;
    setIsResizing(true);
    
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    
    if (animationFrameRef.current === null) {
        animationFrameRef.current = window.requestAnimationFrame(updateResize);
    }
  }, [handlePointerMove, handlePointerUp, updateResize, widthPct, heightPx, fontSize, lineHeight, initialMarginLeft, initialMarginRight]);

  const wrapperStyle: React.CSSProperties = useMemo(() => {
    const baseStyle = {
      width: (marginLeftPct !== undefined || marginRightPct !== undefined) ? `${widthPct}%` : (widthPct && widthPct < 100 ? `${widthPct}%` : '100%'),
      minWidth: '60px',
      height: heightPx > 0 ? `${heightPx}px` : 'auto',
      maxWidth: '100%',
      transform: `translateY(${top}px)`,
      transition: isDraggingRef.current ? 'none' : 'transform 0.1s ease-out'
    };
    
    if (marginLeftPct !== undefined || marginRightPct !== undefined) {
      return { ...baseStyle, marginLeft: `${initialMarginLeft}%`, marginRight: `${initialMarginRight}%` };
    }

    return { ...baseStyle, margin: align === 'left' ? '0 auto 0 0' : '0 auto' };
  }, [widthPct, heightPx, align, marginLeftPct, marginRightPct, initialMarginLeft, initialMarginRight, top]);


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
        startMove(event);
      }}
      className="relative select-none"
      style={{ ...wrapperStyle, touchAction: 'none' }}
    >
      <div className="relative w-full" style={{ lineHeight }}>
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
            className="min-h-[1.3em] outline-none select-text"
            style={{ width: '100%', textAlign: 'inherit', whiteSpace: 'pre-wrap', wordBreak: 'break-word', textWrap: 'auto', fontSize: `${fontSize}rem`, lineHeight, ...style }}
          >
            {text}
          </div>
        ) : (
          <div className="relative w-full" style={{ lineHeight }}>
            {children}
          </div>
        )}
      </div>

      {isSelected && (
        <>
          {/* Borda roxa de seleção estilo Canva */}
          <div className="absolute inset-0 rounded-sm border-2 border-[#8b5cf6] pointer-events-none export-ignore shadow-sm z-30" />
          
          {/* Círculos brancos nos 4 cantos para redimensionamento diagonal */}
          <div
            title="Redimensionar proporção e tamanho"
            className="absolute left-0 top-0 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white border border-gray-300 shadow-md cursor-nwse-resize export-ignore active:scale-125 transition-transform z-40"
            style={{ touchAction: 'none' }}
            onPointerDown={startResize('both', 'nw')}
          />
          <div
            title="Redimensionar proporção e tamanho"
            className="absolute right-0 top-0 h-3.5 w-3.5 translate-x-1/2 -translate-y-1/2 rounded-full bg-white border border-gray-300 shadow-md cursor-nesw-resize export-ignore active:scale-125 transition-transform z-40"
            style={{ touchAction: 'none' }}
            onPointerDown={startResize('both', 'ne')}
          />
          <div
            title="Redimensionar proporção e tamanho"
            className="absolute left-0 bottom-0 h-3.5 w-3.5 -translate-x-1/2 translate-y-1/2 rounded-full bg-white border border-gray-300 shadow-md cursor-nesw-resize export-ignore active:scale-125 transition-transform z-40"
            style={{ touchAction: 'none' }}
            onPointerDown={startResize('both', 'sw')}
          />
          <div
            title="Redimensionar proporção e tamanho"
            className="absolute right-0 bottom-0 h-3.5 w-3.5 translate-x-1/2 translate-y-1/2 rounded-full bg-white border border-gray-300 shadow-md cursor-nwse-resize export-ignore active:scale-125 transition-transform z-40"
            style={{ touchAction: 'none' }}
            onPointerDown={startResize('both', 'se')}
          />

          {/* Alças laterais em pílula (vertical) estilo Canva para ajustar largura da caixa de texto */}
          <div
            title="Ajustar largura da caixa de texto"
            className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-6 bg-white border border-[#8b5cf6] rounded-full shadow-md cursor-ew-resize export-ignore hover:scale-110 active:scale-125 transition-transform z-40 flex items-center justify-center"
            onPointerDown={startResize('width', 'w')}
          />
          <div
            title="Ajustar largura da caixa de texto"
            className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-2 h-6 bg-white border border-[#8b5cf6] rounded-full shadow-md cursor-ew-resize export-ignore hover:scale-110 active:scale-125 transition-transform z-40 flex items-center justify-center"
            onPointerDown={startResize('width', 'e')}
          />

          {/* Alças superior e inferior em pílula (horizontal) estilo Canva para ajustar espaçamento entre linhas */}
          <div
            title="Ajustar espaçamento entre linhas"
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-2 bg-white border border-[#8b5cf6] rounded-full shadow-md cursor-ns-resize export-ignore hover:scale-110 active:scale-125 transition-transform z-40 flex items-center justify-center"
            onPointerDown={startResize('lineHeight', 'n')}
          />
          <div
            title="Ajustar espaçamento entre linhas"
            className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-6 h-2 bg-white border border-[#8b5cf6] rounded-full shadow-md cursor-ns-resize export-ignore hover:scale-110 active:scale-125 transition-transform z-40 flex items-center justify-center"
            onPointerDown={startResize('lineHeight', 's')}
          />
        </>
      )}
      {isResizing && (
        <div className="absolute inset-0 bg-white/5 pointer-events-none z-20" />
      )}
    </div>
  );
}
