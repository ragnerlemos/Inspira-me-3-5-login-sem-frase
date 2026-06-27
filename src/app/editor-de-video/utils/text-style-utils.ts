import React from 'react';

export const EMOJI_REGEX = /([\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}])/gu;

export const createStrokeStyle = (
  strokeWidth: number,
  strokeColor: string,
  strokeCornerStyle: 'rounded' | 'square'
): React.CSSProperties => {
  if (strokeWidth <= 0) {
    return {};
  }
  
  const shadows: string[] = [];
  const width = strokeWidth * 0.5; 

  if (strokeCornerStyle === 'rounded') {
    const numPoints = 12;
    for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * (2 * Math.PI);
        const x = Math.cos(angle) * width;
        const y = Math.sin(angle) * width;
        shadows.push(`${x.toFixed(2)}px ${y.toFixed(2)}px ${width * 0.5}px ${strokeColor}`);
    }
  } else {
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        if (x === 0 && y === 0) continue;
        shadows.push(`${x * width}px ${y * width}px 0 ${strokeColor}`);
      }
    }
  }

  return { textShadow: shadows.join(', ') };
};

export const createDropShadowStyle = (
  blur: number,
  intensityPercent: number
): React.CSSProperties => {
  if (blur <= 0 || intensityPercent <= 0) {
    return {};
  }

  const shadowColor = 'rgba(0,0,0,0.8)'; 
  const offsetY = blur * 0.1;
  const offsetX = blur * 0.05;
  
  const numLayers = Math.max(1, Math.ceil((intensityPercent / 100) * 5));
  
  const shadows = [];

  for (let i = 1; i <= numLayers; i++) {
    const progress = i / numLayers;
    const layerBlur = blur * progress;
    const shadow = `drop-shadow(${offsetX.toFixed(2)}px ${offsetY.toFixed(2)}px ${layerBlur.toFixed(2)}px ${shadowColor})`;
    shadows.push(shadow);
  }

  return {
    filter: shadows.join(" "),
  };
};
