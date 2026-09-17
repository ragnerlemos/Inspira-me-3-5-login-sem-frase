'use client';

import React, { useRef, useCallback, useEffect } from 'react';

interface InstagramFontSliderProps {
  value: number; // e.g. 0.5 to 2.2 (normal 1.0)
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  className?: string;
}

export function InstagramFontSlider({
  value,
  min = 0.5,
  max = 2.2,
  onChange,
  className = '',
}: InstagramFontSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  // Clamped percent between 0% (bottom/min) and 100% (top/max)
  const clampedValue = Math.min(Math.max(value, min), max);
  const percent = ((clampedValue - min) / (max - min)) * 100;

  const updateFromPointer = useCallback(
    (clientY: number) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const height = rect.height;
      if (height <= 0) return;

      const offsetY = rect.bottom - clientY;
      const ratio = Math.min(Math.max(offsetY / height, 0), 1);
      const newValue = min + ratio * (max - min);
      const rounded = Math.round(newValue * 100) / 100;
      onChange(rounded);
    },
    [min, max, onChange]
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    updateFromPointer(e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    e.preventDefault();
    updateFromPointer(e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      try {
        (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
      } catch {}
    }
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      isDraggingRef.current = false;
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('touchend', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, []);

  return (
    <div
      id="instagram-font-slider-container"
      className={`relative flex flex-col items-center justify-between select-none py-1 px-1 ${className}`}
      style={{ touchAction: 'none' }}
    >
      {/* Indicador topo (A grande) */}
      <span className="text-[13px] font-extrabold text-white/90 select-none pb-1 tracking-wider">
        A
      </span>

      {/* Pista do slider em funil */}
      <div
        id="instagram-font-slider-track"
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative w-8 h-44 sm:h-52 cursor-pointer flex items-center justify-center"
      >
        {/* SVG em formato cônico / funil estilo Instagram */}
        <svg
          className="w-full h-full pointer-events-none drop-shadow-md"
          viewBox="0 0 32 200"
          preserveAspectRatio="none"
        >
          {/* Fundo do funil translúcido */}
          <polygon
            points="5,0 27,0 18,200 14,200"
            fill="rgba(255, 255, 255, 0.25)"
          />

          {/* Preenchimento azul progressivo */}
          <defs>
            <clipPath id="instagram-slider-clip">
              <rect
                x="0"
                y={`${100 - percent}%`}
                width="32"
                height={`${percent}%`}
              />
            </clipPath>
          </defs>
          <polygon
            points="5,0 27,0 18,200 14,200"
            fill="#3b82f6"
            clipPath="url(#instagram-slider-clip)"
          />
        </svg>

        {/* Knob arrastável */}
        <div
          id="instagram-font-slider-thumb"
          className="absolute left-1/2 -translate-x-1/2 pointer-events-none flex items-center justify-center"
          style={{
            bottom: `calc(${percent}% - 14px)`,
          }}
        >
          <div className="w-7 h-7 rounded-full bg-white border-2 border-blue-500 shadow-xl flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
          </div>
        </div>
      </div>

      {/* Indicador base (A pequeno) */}
      <span className="text-[9px] font-bold text-white/50 select-none pt-1">
        A
      </span>
    </div>
  );
}
