
"use client";

import { useState, useEffect, useCallback } from "react";

const PROFILE_KEY = "quotevid_profile";

// Definição de tipo movida para dentro do hook para evitar importações circulares
export interface ProfileData {
  username: string;
  social: string;
  photo: string | null;
  logo: string | null;
  logo2: string | null; // Novo campo para a segunda logomarca
  showIcon: boolean;
  showDate: boolean;
  iconUrl?: string;
  memeFontSize: number;
  memeShowLogo: boolean;
  memeLogoScale: number;
  // Novos campos de tema
  themeTitleColor: string;
  themeSubtitleColor: string;
  themeSecondaryTextColor: string;
  themeInterfaceIconColor: string;
  themeMenuIconColor: string;
  themeFavoriteColor: string;
  themeCardTextColor: string;
  themeCardBorderColor: string;
  themeCardAlt1Color: string;
  themeCardAlt2Color: string;
  themeCardAlt3Color: string;
  themeCardAlt4Color: string;
}

// Hook para gerenciar os dados do perfil do usuário usando o localStorage.
export const useProfile = () => {
  const defaultState: ProfileData = {
    username: "Seu Nome",
    social: "@seuusario",
    photo: null,
    iconUrl: '',
    showIcon: false,
    showDate: false,
    logo: null,
    logo2: null,
    memeFontSize: 1.3,
    memeShowLogo: false,
    memeLogoScale: 40,
    // Valores padrão para o tema
    themeTitleColor: "#3b82f6", // Primary blue roughly
    themeSubtitleColor: "#94a3b8",
    themeSecondaryTextColor: "#64748b",
    themeInterfaceIconColor: "#94a3b8",
    themeMenuIconColor: "#94a3b8",
    themeFavoriteColor: "#eab308",
    themeCardTextColor: "#ffffff",
    themeCardBorderColor: "#1e293b",
    themeCardAlt1Color: "#020617",
    themeCardAlt2Color: "#0f172a",
    themeCardAlt3Color: "#020617",
    themeCardAlt4Color: "#0f172a",
  };

  const [profile, setProfile] = useState<ProfileData>(() => {
    if (typeof window !== "undefined") {
      try {
        const storedProfile = localStorage.getItem(PROFILE_KEY);
        if (storedProfile) {
          const loadedProfile = JSON.parse(storedProfile);
          return {
            username: loadedProfile.username !== undefined ? loadedProfile.username : defaultState.username,
            social: loadedProfile.social !== undefined ? loadedProfile.social : defaultState.social,
            photo: loadedProfile.photo !== undefined ? loadedProfile.photo : defaultState.photo,
            iconUrl: loadedProfile.iconUrl !== undefined ? loadedProfile.iconUrl : defaultState.iconUrl,
            showIcon: loadedProfile.showIcon !== undefined ? loadedProfile.showIcon : defaultState.showIcon,
            showDate: loadedProfile.showDate !== undefined ? loadedProfile.showDate : defaultState.showDate,
            logo: loadedProfile.logo !== undefined ? loadedProfile.logo : defaultState.logo,
            logo2: loadedProfile.logo2 !== undefined ? loadedProfile.logo2 : defaultState.logo2,
            memeFontSize: loadedProfile.memeFontSize !== undefined ? loadedProfile.memeFontSize : defaultState.memeFontSize,
            memeShowLogo: loadedProfile.memeShowLogo !== undefined ? loadedProfile.memeShowLogo : defaultState.memeShowLogo,
            memeLogoScale: loadedProfile.memeLogoScale !== undefined ? loadedProfile.memeLogoScale : defaultState.memeLogoScale,
            // Carregamento dos novos campos de tema com fallback para o defaultState
            themeTitleColor: loadedProfile.themeTitleColor || defaultState.themeTitleColor,
            themeSubtitleColor: loadedProfile.themeSubtitleColor || defaultState.themeSubtitleColor,
            themeSecondaryTextColor: loadedProfile.themeSecondaryTextColor || defaultState.themeSecondaryTextColor,
            themeInterfaceIconColor: loadedProfile.themeInterfaceIconColor || defaultState.themeInterfaceIconColor,
            themeMenuIconColor: loadedProfile.themeMenuIconColor || defaultState.themeMenuIconColor,
            themeFavoriteColor: loadedProfile.themeFavoriteColor || defaultState.themeFavoriteColor,
            themeCardTextColor: loadedProfile.themeCardTextColor || defaultState.themeCardTextColor,
            themeCardBorderColor: loadedProfile.themeCardBorderColor || defaultState.themeCardBorderColor,
            themeCardAlt1Color: loadedProfile.themeCardAlt1Color || defaultState.themeCardAlt1Color,
            themeCardAlt2Color: loadedProfile.themeCardAlt2Color || defaultState.themeCardAlt2Color,
            themeCardAlt3Color: loadedProfile.themeCardAlt3Color || defaultState.themeCardAlt3Color,
            themeCardAlt4Color: loadedProfile.themeCardAlt4Color || defaultState.themeCardAlt4Color,
          };
        }
      } catch (error) {
        console.error("Failed to parse profile from localStorage", error);
      }
    }
    return defaultState;
  });
  const [isLoaded, setIsLoaded] = useState(() => {
    return typeof window !== "undefined";
  });

  // Função para atualizar e salvar o perfil.
  const updateProfile = useCallback((newProfileData: Partial<ProfileData>) => {
    setProfile((prevProfile) => {
      const updatedProfile = { ...prevProfile, ...newProfileData };
      try {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(updatedProfile));
      } catch (error) {
        console.error("Failed to save profile to localStorage", error);
      }
      return updatedProfile;
    });
  }, []);

  return { profile, updateProfile, isLoaded };
};
