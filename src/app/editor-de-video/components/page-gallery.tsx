"use client";

import React, { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Copy, 
  Trash2, 
  ArrowLeft, 
  ArrowRight, 
  Layers, 
  LayoutTemplate, 
  MoreHorizontal, 
  X 
} from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useEditor } from "../contexts/editor-context";
import { useProfile } from "@/hooks/use-profile";
import { ModeloPadrao } from "../modelos/modelo-padrao";
import { ModeloTwitter } from "../modelos/modelo-twitter";

interface PageGalleryProps {
  pages: any[];
  currentIndex: number;
  selectedIndices: number[];
  changesApplyScope: "current" | "all";
  onSelect: (index: number) => void;
  onDuplicate: (index: number) => void;
  onDelete: (index: number) => void;
  onReorder: (from: number, to: number) => void;
  onScopeChange: (scope: "current" | "all") => void;
}

// Sub-componente de miniatura em alta fidelidade com memoização para alta performance
const PageMiniature = React.memo(({
  page,
  profile,
  baseTextStyle,
  textEffectsStyle,
  dropShadowStyle,
  thumbWidth,
  thumbHeight,
}: {
  page: any;
  profile: any;
  baseTextStyle: any;
  textEffectsStyle: any;
  dropShadowStyle: any;
  thumbWidth: number;
  thumbHeight: number;
}) => {
  const { activeTemplateId, aspectRatio = "9 / 16", filmColor = "#000000", filmOpacity = 0 } = page;
  
  const ratioStr = aspectRatio.replace(/\s/g, "");
  const canvasW = ratioStr === "9/16" ? 340 : 400;
  const canvasH = ratioStr === "9/16" ? 604.4 : ratioStr === "16/9" ? 225 : 400;

  const scale = Math.min(thumbWidth / canvasW, thumbHeight / canvasH) * 0.94;

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const filmRgb = hexToRgb(filmColor);
  const filmBgColor = filmRgb 
    ? `rgba(${filmRgb.r}, ${filmRgb.g}, ${filmRgb.b}, ${filmOpacity / 100})` 
    : `rgba(0, 0, 0, ${filmOpacity / 100})`;

  const renderBackground = () => {
    if (!page.backgroundStyle) return <div className="absolute inset-0 bg-black" />;
    const { type, value, blur, brightness, contrast, grayscale, sepia, hueRotate } = page.backgroundStyle;
    
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
      return (
        <div className="absolute inset-0 overflow-hidden" style={filterStyle}>
          <img src={value} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>
      );
    } else if (type === "solid") {
      return <div className="absolute inset-0" style={{ backgroundColor: value, ...filterStyle }} />;
    } else if (type === "gradient") {
      return <div className="absolute inset-0" style={{ background: value, ...filterStyle }} />;
    }
    return <div className="absolute inset-0 bg-black" />;
  };

  const renderVignette = () => {
    const { vignette } = page;
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

  const renderContent = () => {
    const modeloProps = {
      editorState: page,
      baseTextStyle,
      textEffectsStyle,
      dropShadowStyle,
      profile,
      isTextSelected: false,
      setIsTextSelected: () => {},
      onTextBoxResize: () => {},
      onTextChange: () => {},
    };

    if (activeTemplateId === "template-twitter") {
      return <ModeloTwitter {...modeloProps} />;
    }
    return <ModeloPadrao {...modeloProps} />;
  };

  return (
    <div 
      style={{
        width: `${thumbWidth}px`,
        height: `${thumbHeight}px`,
      }}
      className="relative overflow-hidden shrink-0 rounded-sm flex items-center justify-center bg-black"
    >
      <div 
        className="absolute overflow-hidden bg-black pointer-events-none rounded-sm shrink-0"
        style={{
          width: `${canvasW}px`,
          height: `${canvasH}px`,
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        {renderBackground()}
        {renderVignette()}
        {filmOpacity > 0 && (
          <div className="absolute inset-0 z-10" style={{ backgroundColor: filmBgColor }} />
        )}
        <div className="relative z-20 h-full w-full">
          {renderContent()}
        </div>
      </div>
    </div>
  );
});

PageMiniature.displayName = "PageMiniature";

export function PageGallery({
  pages,
  currentIndex,
  selectedIndices,
  changesApplyScope,
  onSelect,
  onDuplicate,
  onDelete,
  onReorder,
  onScopeChange,
}: PageGalleryProps) {
  const { profile } = useProfile();
  const { baseTextStyle, textEffectsStyle, dropShadowStyle } = useEditor();

  const galleryRef = useRef<HTMLDivElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  // Responsive gallery measurement
  const [galleryHeight, setGalleryHeight] = useState(180);
  const [showActionsIndex, setShowActionsIndex] = useState<number | null>(null);

  // HTML5 drag and drop states
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Mouse drag-to-scroll refs
  const isMouseDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  useEffect(() => {
    const el = galleryRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { height } = entries[0].contentRect;
      if (height > 0) {
        setGalleryHeight(height);
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Calculate dynamic thumbnail sizes ensuring exact proportion and no overflow
  const thumbHeight = Math.max(40, galleryHeight - 88);

  const ratioStr = (pages[0]?.aspectRatio || "9/16").replace(/\s/g, "");
  let thumbWidth = thumbHeight;
  if (ratioStr === "9/16") {
    thumbWidth = thumbHeight * (9 / 16);
  } else if (ratioStr === "16/9") {
    thumbWidth = thumbHeight * (16 / 9);
  }

  // TanStack Virtualizer
  const virtualizer = useVirtualizer({
    horizontal: true,
    count: pages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => thumbWidth + 12,
    overscan: 5,
  });

  // Force remeasure of list items when proportional thumbWidth changes
  useEffect(() => {
    virtualizer.measure();
  }, [thumbWidth, virtualizer]);

  // Auto-scroll to active item on page index change
  useEffect(() => {
    virtualizer.scrollToIndex(currentIndex, { align: "center" });
  }, [currentIndex, virtualizer]);

  if (!pages || pages.length <= 1) return null;

  // Desktop drag-to-scroll mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!parentRef.current) return;
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest('[draggable="true"]')) return;

    isMouseDownRef.current = true;
    startXRef.current = e.pageX - parentRef.current.offsetLeft;
    scrollLeftRef.current = parentRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isMouseDownRef.current = false;
  };

  const handleMouseUp = () => {
    isMouseDownRef.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current || !parentRef.current) return;
    e.preventDefault();
    const x = e.pageX - parentRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    parentRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  // HTML5 Drag and Drop handlers (Desktop)
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      onReorder(draggedIndex, targetIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div 
      ref={galleryRef}
      className="w-full h-full flex flex-col gap-2 p-2 border-t bg-background/50 backdrop-blur-sm select-none"
    >
      {/* Header controls bar */}
      <div className="flex items-center justify-between px-2 h-[28px] shrink-0">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Páginas ({pages.length})
        </span>
        
        {/* Scope toggle */}
        <div className="flex bg-muted rounded-md p-0.5">
          <button
            onClick={() => onScopeChange("current")}
            className={cn(
              "px-3 py-1 text-xs font-medium rounded-sm flex items-center gap-1.5 transition-colors",
              changesApplyScope === "current" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
            title="Alterações afetam apenas a página atual"
          >
            <LayoutTemplate className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Página Atual</span>
          </button>
          <button
            onClick={() => onScopeChange("all")}
            className={cn(
              "px-3 py-1 text-xs font-medium rounded-sm flex items-center gap-1.5 transition-colors",
              changesApplyScope === "all" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
            title="Alterações de estilo afetam todas as páginas (preserva os textos)"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Todas</span>
          </button>
        </div>
      </div>

      {/* Main scrolling wrapper */}
      <div
        ref={parentRef}
        className="w-full flex-1 overflow-x-auto overflow-y-hidden cursor-grab active:cursor-grabbing scroll-smooth"
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        style={{ touchAction: "pan-x" }}
      >
        <div
          style={{
            width: `${virtualizer.getTotalSize()}px`,
            height: "100%",
            position: "relative",
          }}
          className="flex items-center"
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const page = pages[virtualItem.index];
            const isActive = currentIndex === virtualItem.index;
            const isSelected = selectedIndices.includes(virtualItem.index);

            return (
              <div
                key={virtualItem.key}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: `${thumbWidth + 12}px`,
                  height: "100%",
                  transform: `translateX(${virtualItem.start}px)`,
                }}
                className="px-1.5 py-1 relative group"
                draggable={true}
                onDragStart={(e) => handleDragStart(e, virtualItem.index)}
                onDragOver={(e) => handleDragOver(e, virtualItem.index)}
                onDragEnd={handleDragEnd}
                onDrop={(e) => handleDrop(e, virtualItem.index)}
              >
                {/* Drag drop drop indicator bar */}
                {dragOverIndex === virtualItem.index && (
                  <div className={cn(
                    "absolute top-0 bottom-0 w-1 bg-primary z-50 rounded-full animate-pulse",
                    draggedIndex !== null && draggedIndex < virtualItem.index ? "right-0" : "left-0"
                  )} />
                )}

                <div
                  onClick={() => onSelect(virtualItem.index)}
                  style={{ width: `${thumbWidth}px` }}
                  className={cn(
                    "relative mx-auto h-full rounded-md border-2 overflow-hidden cursor-pointer transition-all flex flex-col bg-muted/20 select-none",
                    isActive ? "border-primary ring-2 ring-primary/20" : isSelected ? "border-primary/50" : "border-border/60 hover:border-border"
                  )}
                >
                  {/* High Fidelity Page Miniature Preview Container */}
                  <div 
                    className="relative flex items-center justify-center overflow-hidden bg-[#0a0e1a]/20 shrink-0"
                    style={{ height: `${thumbHeight}px`, width: `${thumbWidth}px` }}
                  >
                    <PageMiniature 
                      page={page}
                      profile={profile}
                      baseTextStyle={baseTextStyle}
                      textEffectsStyle={textEffectsStyle}
                      dropShadowStyle={dropShadowStyle}
                      thumbWidth={thumbWidth}
                      thumbHeight={thumbHeight}
                    />
                  </div>

                  {/* Footer / Number indicator */}
                  <div className="h-6 bg-muted/80 backdrop-blur border-t flex items-center justify-center text-[11px] font-bold text-muted-foreground relative z-20 shrink-0">
                    {virtualItem.index + 1}
                  </div>

                  {/* Toggle Button for actions overlay (essential for mobile/touch) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowActionsIndex(showActionsIndex === virtualItem.index ? null : virtualItem.index);
                    }}
                    className="absolute top-1.5 right-1.5 z-40 bg-background/90 text-foreground rounded-full p-1.5 border shadow-sm transition-opacity opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:scale-105 active:scale-95"
                    title="Ações da página"
                  >
                    {showActionsIndex === virtualItem.index ? (
                      <X className="w-4 h-4" />
                    ) : (
                      <MoreHorizontal className="w-4 h-4" />
                    )}
                  </button>

                  {/* Responsive overlay menu with comfortable touch targets */}
                  <div className={cn(
                    "absolute inset-0 bg-background/95 backdrop-blur-sm transition-all flex flex-col items-center justify-center gap-2 z-30 select-none",
                    showActionsIndex === virtualItem.index
                      ? "opacity-100 scale-100 pointer-events-auto"
                      : "opacity-0 scale-95 pointer-events-none md:group-hover:opacity-100 md:group-hover:pointer-events-auto"
                  )}>
                    <div className="flex items-center gap-2">
                       <Button 
                         size="icon" 
                         variant="secondary" 
                         className="w-10 h-10 rounded-full shadow-sm hover:bg-accent transition-colors shrink-0" 
                         onClick={(e) => { 
                           e.stopPropagation(); 
                           onReorder(virtualItem.index, Math.max(0, virtualItem.index - 1)); 
                           setShowActionsIndex(null);
                         }} 
                         disabled={virtualItem.index === 0}
                         title="Mover para esquerda"
                       >
                          <ArrowLeft className="w-4 h-4" />
                       </Button>
                       <Button 
                         size="icon" 
                         variant="secondary" 
                         className="w-10 h-10 rounded-full shadow-sm hover:bg-accent transition-colors shrink-0" 
                         onClick={(e) => { 
                           e.stopPropagation(); 
                           onReorder(virtualItem.index, Math.min(pages.length - 1, virtualItem.index + 1)); 
                           setShowActionsIndex(null);
                         }} 
                         disabled={virtualItem.index === pages.length - 1}
                         title="Mover para direita"
                       >
                          <ArrowRight className="w-4 h-4" />
                       </Button>
                    </div>
                    <div className="flex items-center gap-2">
                       <Button 
                         size="icon" 
                         variant="secondary" 
                         className="w-10 h-10 rounded-full shadow-sm hover:bg-accent transition-colors shrink-0" 
                         onClick={(e) => { 
                           e.stopPropagation(); 
                           onDuplicate(virtualItem.index); 
                           setShowActionsIndex(null);
                         }}
                         title="Duplicar página"
                       >
                          <Copy className="w-4 h-4" />
                       </Button>
                       <Button 
                         size="icon" 
                         variant="destructive" 
                         className="w-10 h-10 rounded-full shadow-sm hover:bg-destructive/90 transition-colors shrink-0" 
                         onClick={(e) => { 
                           e.stopPropagation(); 
                           onDelete(virtualItem.index); 
                           setShowActionsIndex(null);
                         }} 
                         disabled={pages.length <= 1}
                         title="Excluir página"
                       >
                          <Trash2 className="w-4 h-4" />
                       </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
