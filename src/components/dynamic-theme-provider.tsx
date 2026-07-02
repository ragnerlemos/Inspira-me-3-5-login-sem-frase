'use client';

import { useProfile } from '@/hooks/use-profile';
import { useEffect } from 'react';
import { useTheme } from 'next-themes';

/**
 * Componente que aplica as cores personalizadas do usuário como variáveis CSS.
 * Isso permite que o sistema de tema seja dinâmico sem recrear componentes.
 */
export function DynamicThemeProvider() {
  const { profile, isLoaded } = useProfile();
  const { theme, resolvedTheme } = useTheme();

  useEffect(() => {
    if (!isLoaded) return;

    const root = document.documentElement;
    const activeTheme = resolvedTheme || theme;
    
    if (activeTheme === 'light') {
      // Aplicando cores elegantes e de alto contraste para o Modo Claro
      root.style.setProperty('--theme-title-color', '#2563eb'); // Azul vibrante
      root.style.setProperty('--theme-subtitle-color', '#475569'); // Slate-600
      root.style.setProperty('--theme-secondary-text-color', '#475569'); // Slate-600 (autor do card)
      root.style.setProperty('--theme-interface-icon-color', '#64748b'); // Slate-500 (ícones de ação)
      root.style.setProperty('--theme-menu-icon-color', '#475569'); // Slate-600
      root.style.setProperty('--theme-favorite-color', '#eab308'); // Amarelo favoritado
      root.style.setProperty('--theme-card-text-color', '#0f172a'); // Slate-900 (texto escuro da frase)
      root.style.setProperty('--theme-card-border-color', '#cbd5e1'); // Slate-300 (borda limpa e sutil)
      root.style.setProperty('--theme-card-alt1-color', '#ffffff'); // Branco
      root.style.setProperty('--theme-card-alt2-color', '#f1f5f9'); // Slate-100 (alternância suave)
      root.style.setProperty('--theme-card-alt3-color', '#ffffff'); // Branco
      root.style.setProperty('--theme-card-alt4-color', '#f1f5f9'); // Slate-100
    } else {
      // Aplicando cores originais personalizadas para o Modo Escuro
      root.style.setProperty('--theme-title-color', profile.themeTitleColor);
      root.style.setProperty('--theme-subtitle-color', profile.themeSubtitleColor);
      root.style.setProperty('--theme-secondary-text-color', profile.themeSecondaryTextColor);
      root.style.setProperty('--theme-interface-icon-color', profile.themeInterfaceIconColor);
      root.style.setProperty('--theme-menu-icon-color', profile.themeMenuIconColor);
      root.style.setProperty('--theme-favorite-color', profile.themeFavoriteColor);
      root.style.setProperty('--theme-card-text-color', profile.themeCardTextColor);
      root.style.setProperty('--theme-card-border-color', profile.themeCardBorderColor);
      root.style.setProperty('--theme-card-alt1-color', profile.themeCardAlt1Color);
      root.style.setProperty('--theme-card-alt2-color', profile.themeCardAlt2Color);
      root.style.setProperty('--theme-card-alt3-color', profile.themeCardAlt3Color);
      root.style.setProperty('--theme-card-alt4-color', profile.themeCardAlt4Color);
    }

  }, [profile, isLoaded, theme, resolvedTheme]);

  return null;
}
