
"use client";

import { useEffect } from 'react';

const FONT_URL = "https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=PT+Sans:wght@400;700&family=Lobster&family=Merriweather:ital,wght@0,400;0,700;1,400&display=swap";
const FONT_STYLE_ID = "google-fonts-stylesheet";

/**
 * Hook para buscar as fontes do Google Fonts e injetá-las como uma tag <style> no <head>.
 * Isso transforma as regras de fonte em "same-origin", resolvendo erros de CORS
 * que impedem bibliotecas como html-to-image de acessá-las.
 */
export const useGoogleFonts = () => {
  useEffect(() => {
    // Se a folha de estilo já foi injetada, não faz nada.
    if (document.getElementById(FONT_STYLE_ID)) {
      return;
    }

    try {
      fetch(FONT_URL)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
          }
          return response.text();
        })
        .then(cssText => {
          const style = document.createElement('style');
          style.id = FONT_STYLE_ID;
          style.innerHTML = cssText;
          document.head.appendChild(style);
        })
        .catch(err => {
          console.warn("Falha ao buscar fontes do Google por fetch. Usando fallback via <link>.", err);
          injectFontLinkFallback();
        });
    } catch (e) {
      console.warn("Falha síncrona ao buscar fontes do Google. Usando fallback via <link>.", e);
      injectFontLinkFallback();
    }

    function injectFontLinkFallback() {
      if (document.getElementById(FONT_STYLE_ID)) return;
      const link = document.createElement('link');
      link.id = FONT_STYLE_ID;
      link.rel = 'stylesheet';
      link.href = FONT_URL;
      document.head.appendChild(link);
    }

  }, []);
};
