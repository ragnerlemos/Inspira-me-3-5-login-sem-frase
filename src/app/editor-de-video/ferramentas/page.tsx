'use client';

import { useState, useMemo } from 'react';
// createStrokeStyle agora contém o algoritmo definitivo que funciona para tudo.
import { FerramentaContorno } from './Ferramenta-Contorno';
import { FerramentaSombra } from './Ferramenta-Sombra';
import { FerramentasBasicas } from './Ferramentas-Basicas';
import { FerramentaEmojis } from './Ferramenta-Emojis';
import { createStrokeStyle } from '../utils/text-style-utils';
import { createDropShadowStyle } from '../utils/text-style-utils';


interface ToolEditorState {
  text: string;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  shadowBlur: number;
  shadowOpacity: number;
  strokeWidth: number;
  strokeColor: string;
  strokeCornerStyle: 'rounded' | 'square';
  applyEffectsToEmojis: boolean;
}

const EMOJI_REGEX = /([\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}])/gu;

export default function FerramentasEditorPage() {
  const [state, setState] = useState<ToolEditorState>({
    text: 'Texto de Exemplo com Emoji ✨',
    fontWeight: 'bold',
    fontStyle: 'normal',
    shadowBlur: 5,
    shadowOpacity: 75,
    strokeWidth: 2,
    strokeColor: '#000000',
    strokeCornerStyle: 'square', // Iniciar com quadrado para ver o efeito
    applyEffectsToEmojis: true,
  });

  const updateState = (newState: Partial<ToolEditorState>) => {
    setState((prev) => ({ ...prev, ...newState }));
  };

  // --- Lógica de Estilo 100% Unificada ---
  const textEffectsStyle = useMemo(() => {
    // 1. Gera o estilo de contorno (quadrado ou redondo) usando o novo algoritmo.
    const stroke = createStrokeStyle(state.strokeWidth, state.strokeColor, state.strokeCornerStyle);
    // 2. Gera a sombra projetada.
    const dropShadow = createDropShadowStyle(state.shadowBlur, state.shadowOpacity);
    
    // 3. Combina os dois efeitos em uma única propriedade text-shadow.
    const combinedShadows = [stroke.textShadow, (dropShadow as any).textShadow]
      .filter(Boolean)
      .join(', ');

    // 4. Retorna o objeto de estilo final. Simples e unificado.
    return { textShadow: combinedShadows };

  }, [state.shadowBlur, state.shadowOpacity, state.strokeWidth, state.strokeColor, state.strokeCornerStyle]);


  // --- Renderização ---
  const renderTextWithEmojis = () => {
    const parts = state.text.split(EMOJI_REGEX);
    
    const baseStyle: React.CSSProperties = {
      fontWeight: state.fontWeight,
      fontStyle: state.fontStyle,
      fontSize: '60px',
      color: 'white',
      fontFamily: 'Poppins, sans-serif',
    };
    
    // O mesmo estilo (base + efeitos) é aplicado a tudo.
    const combinedStyle = { ...baseStyle, ...textEffectsStyle };

    return (
      <div style={combinedStyle}>
        {parts.map((part, index) => {
          // Se for um emoji e os efeitos estiverem desativados para ele...
          if (index % 2 !== 0 && !state.applyEffectsToEmojis) {
            // Renderiza o emoji sem NENHUM efeito de sombra.
            return (
              <span key={index} style={{ textShadow: 'none' }}>
                {part}
              </span>
            );
          }
          // Caso contrário, renderiza o texto ou emoji com todos os efeitos aplicados.
          return <span key={index}>{part}</span>;
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row h-full w-full">
      <div className="w-full md:w-96 bg-card border-r p-4 space-y-6 overflow-y-auto">
        <h2 className="text-xl font-bold font-headline">Ferramentas de Texto</h2>
        <FerramentasBasicas text={state.text} fontWeight={state.fontWeight} fontStyle={state.fontStyle} updateState={updateState} />
        <FerramentaSombra shadowBlur={state.shadowBlur} shadowOpacity={state.shadowOpacity} updateState={updateState} />
        <FerramentaContorno strokeWidth={state.strokeWidth} strokeColor={state.strokeColor} strokeCornerStyle={state.strokeCornerStyle} updateState={updateState} />
        <FerramentaEmojis applyEffectsToEmojis={state.applyEffectsToEmojis} updateState={updateState} />
      </div>
      <div className="flex-1 flex items-center justify-center bg-muted/40 p-4">
        <div className="text-center break-words">{renderTextWithEmojis()}</div>
      </div>
    </div>
  );
}
