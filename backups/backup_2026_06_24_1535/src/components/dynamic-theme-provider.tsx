'use client';

import { useProfile } from '@/hooks/use-profile';
import { useEffect } from 'react';

/**
 * Componente que aplica as cores personalizadas do usuário como variáveis CSS.
 * Isso permite que o sistema de tema seja dinâmico sem recrear componentes.
 */
export function DynamicThemeProvider() {
  const { profile, isLoaded } = useProfile();

  useEffect(() => {
    if (!isLoaded) return;

    const root = document.documentElement;
    
    // Aplicando cores como variáveis CSS
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

  }, [profile, isLoaded]);

  return null;
}
