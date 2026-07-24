import { EstiloFundo } from "../tipos";

export function parseColorToRgb(colorStr: string): { r: number; g: number; b: number } | null {
  if (!colorStr) return null;
  const clean = colorStr.trim().toLowerCase();

  // Hex color (#fff or #ffffff)
  if (clean.startsWith('#')) {
    const hex = clean.replace('#', '');
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      return { r, g, b };
    } else if (hex.length === 6) {
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return { r, g, b };
    }
  }

  // RGB / RGBA color (rgb(255, 255, 255))
  const rgbMatch = clean.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)$/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1], 10),
      g: parseInt(rgbMatch[2], 10),
      b: parseInt(rgbMatch[3], 10),
    };
  }

  return null;
}

export function getContrastColor(backgroundColor: string | EstiloFundo): '#000000' | '#FFFFFF' {
  let bgType = 'solid';
  let bgValue = '#333333';

  if (backgroundColor && typeof backgroundColor === 'object') {
    bgType = backgroundColor.type || 'solid';
    bgValue = backgroundColor.value || '#333333';
  } else if (typeof backgroundColor === 'string') {
    bgValue = backgroundColor;
    if (bgValue.includes('gradient')) {
      bgType = 'gradient';
    }
  }

  if (bgType === 'media') {
    // Por padrão para mídia/vídeos, usamos texto branco devido ao overlay comum ser escuro.
    return '#FFFFFF';
  }

  if (bgType === 'gradient') {
    // Tenta extrair cores hexadecimais do gradiente
    const hexColors = bgValue.match(/#(?:[0-9a-fA-F]{3}){1,2}/g);
    if (hexColors && hexColors.length >= 2) {
      const c1 = parseColorToRgb(hexColors[0]);
      const c2 = parseColorToRgb(hexColors[1]);
      if (c1 && c2) {
        const avgR = (c1.r + c2.r) / 2;
        const avgG = (c1.g + c2.g) / 2;
        const avgB = (c1.b + c2.b) / 2;
        const yiq = (avgR * 299 + avgG * 587 + avgB * 114) / 1000;
        return yiq >= 128 ? '#000000' : '#FFFFFF';
      }
    }
    return '#FFFFFF';
  }

  // Cor sólida
  const rgb = parseColorToRgb(bgValue);
  if (rgb) {
    const yiq = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    return yiq >= 128 ? '#000000' : '#FFFFFF';
  }

  return '#FFFFFF';
}

export function toggleTextColor(textColor: string, backgroundStyle: EstiloFundo): string {
  const normalizedText = textColor.trim().toUpperCase();

  // Regra 1: Se for preto puro, vira branco
  if (normalizedText === '#000000' || normalizedText === 'RGB(0,0,0)' || normalizedText === 'RGB(0, 0, 0)') {
    return '#FFFFFF';
  }

  // Regra 2: Se for branco puro, vira preto
  if (normalizedText === '#FFFFFF' || normalizedText === 'RGB(255,255,255)' || normalizedText === 'RGB(255, 255, 255)') {
    return '#000000';
  }

  // Regra 3: Para qualquer outra cor personalizada, escolhe a cor com melhor contraste (preto ou branco)
  if (backgroundStyle.type === 'media') {
    // Para mídias, se o texto atual for claro, alterna para preto; se for escuro, vira branco
    const rgb = parseColorToRgb(textColor);
    if (rgb) {
      const yiq = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
      return yiq >= 128 ? '#000000' : '#FFFFFF';
    }
    return '#FFFFFF';
  }

  return getContrastColor(backgroundStyle);
}
