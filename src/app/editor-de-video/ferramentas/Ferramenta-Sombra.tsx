
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import React from 'react';

interface FerramentaSombraProps {
  shadowBlur: number;
  shadowOpacity: number;
  updateState: (newState: { shadowBlur?: number; shadowOpacity?: number }) => void;
}

/**
 * Gera o estilo de sombra para o texto.
 * @param blur - O nível de desfoque da sombra.
 * @param opacity - A opacidade da sombra (pode ser > 100 para um efeito mais forte).
 * @returns Um objeto de estilo React com a propriedade textShadow.
 */
export const createDropShadowStyle = (blur: number, opacity: number): React.CSSProperties => {
  if (blur <= 0 || opacity <= 0) {
    return {};
  }

  const numLayers = Math.floor(opacity / 100);
  const lastLayerOpacity = (opacity % 100) / 100;

  const baseOffsetX = blur * 0.1;
  const baseOffsetY = blur * 0.2;
  const blurRadius = blur;
  
  const shadows: string[] = [];

  // Cria camadas "sólidas" para opacidade > 100
  if (numLayers > 0) {
    const solidColor = `rgba(0, 0, 0, 1)`;
    for (let i = 0; i < numLayers; i++) {
        const offsetX = baseOffsetX + i * 0.5;
        const offsetY = baseOffsetY + i * 0.5;
        shadows.push(`${offsetX}px ${offsetY}px ${blurRadius}px ${solidColor}`);
    }
  }

  // Adiciona a camada final com a opacidade restante
  if (lastLayerOpacity > 0) {
    const finalColor = `rgba(0, 0, 0, ${lastLayerOpacity})`;
    const offsetX = baseOffsetX + numLayers * 0.5;
    const offsetY = baseOffsetY + numLayers * 0.5;
    shadows.push(`${offsetX}px ${offsetY}px ${blurRadius}px ${finalColor}`);
  }

  return { textShadow: shadows.join(', ') };
};


export function FerramentaSombra({
  shadowBlur,
  shadowOpacity,
  updateState,
}: FerramentaSombraProps) {
  return (
    <div className="space-y-4 border-t pt-4">
      <h3 className="font-semibold">Sombra</h3>
      <div className="space-y-2">
        <Label htmlFor="shadow-blur">Desfoque da Sombra: {shadowBlur}px</Label>
        <Slider
          id="shadow-blur"
          min={0}
          max={50}
          step={1}
          value={[shadowBlur]}
          onValueChange={(v) => updateState({ shadowBlur: v[0] })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="shadow-opacity">
          Opacidade da Sombra: {shadowOpacity}%
        </Label>
        <Slider
          id="shadow-opacity"
          min={0}
          max={200}
          step={5}
          value={[shadowOpacity]}
          onValueChange={(v) => updateState({ shadowOpacity: v[0] })}
        />
      </div>
    </div>
  );
}
