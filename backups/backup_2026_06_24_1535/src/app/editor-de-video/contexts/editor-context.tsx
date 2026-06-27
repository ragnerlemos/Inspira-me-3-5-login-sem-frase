"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useMemo } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useTemplates } from "@/hooks/use-templates";
import type { EditorState, EstiloTexto } from '../tipos';
import { captureAndDownload, captureThumbnail, generateVideoBlob } from '../exportar';
import type { ExportOptions } from '../components/export-modal';
import { useProfile } from '@/hooks/use-profile';
import useWindowSize from 'react-use/lib/useWindowSize';
import { createStrokeStyle, createDropShadowStyle } from '../utils/text-style-utils';

export interface EditorContextType {
  isReady: boolean;
  canUndo: boolean;
  canRedo: boolean;
  currentState: EditorState | null;
  baseTextStyle: EstiloTexto;
  textEffectsStyle: EstiloTexto;
  dropShadowStyle: EstiloTexto;
  undo: () => void;
  redo: () => void;
  updateState: (newState: Partial<EditorState>) => void;
  setInitialState: (initialState: EditorState) => void;
  onSaveAsTemplate: () => Promise<void>;
  onExportJPG: () => void;
  onExportPNG: () => void;
  onExportMP4: (options: ExportOptions, onProgress?: (p: number) => void) => Promise<{ blob: Blob | null; error?: string }>;
  applyTemplate: (templateState: Partial<EditorState>, strategy?: 'merge' | 'replace') => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<EditorState[]>([]);
  const [currentStateIndex, setCurrentStateIndex] = useState(-1);
  const [isReady, setIsReady] = useState(false);
  const { toast } = useToast();
  const { addTemplate } = useTemplates();
  const { profile } = useProfile();

  const currentState = isReady ? history[currentStateIndex] : null;
  const canUndo = currentStateIndex > 0;
  const canRedo = currentStateIndex < history.length - 1;

  const { baseTextStyle, textEffectsStyle, dropShadowStyle } = useMemo(() => {
      if (!currentState) return { baseTextStyle: {}, textEffectsStyle: {}, dropShadowStyle: {} };

      const baseStyle: EstiloTexto = {
          fontFamily: currentState.fontFamily,
          fontSize: `${currentState.fontSize}cqw`,
          fontWeight: currentState.fontWeight,
          fontStyle: currentState.fontStyle,
          color: currentState.textColor,
          textAlign: currentState.textAlign,
          lineHeight: currentState.lineHeight,
          letterSpacing: `${(currentState.letterSpacing || 0) / 100}em`,
          wordSpacing: `${(currentState.wordSpacing || 0) / 100}em`,
      };

      const strokeStyle = createStrokeStyle(
          currentState.textStrokeWidth,
          currentState.textStrokeColor,
          currentState.textStrokeCornerStyle
      );
      
      const shadowStyle = createDropShadowStyle(
          currentState.textShadowBlur,
          currentState.textShadowOpacity
      );

      const effectsStyle = {
        ...strokeStyle,
      };

      return { baseTextStyle: baseStyle, textEffectsStyle: effectsStyle, dropShadowStyle: shadowStyle };
  }, [currentState]);

  const setInitialState = useCallback((initialState: EditorState) => {
    setHistory([initialState]);
    setCurrentStateIndex(0);
    setIsReady(true);
  }, []);

  const updateState = useCallback((newState: Partial<EditorState>) => {
    if (!isReady || !currentState) return;
    const nextState = { ...currentState, ...newState };
    const newHistory = history.slice(0, currentStateIndex + 1);
    setHistory([...newHistory, nextState]);
    setCurrentStateIndex(newHistory.length);
  }, [isReady, currentState, currentStateIndex, history]);

  const applyTemplate = useCallback((templateState: Partial<EditorState>, strategy: 'merge' | 'replace' = 'merge') => {
      if (!isReady || !currentState) return;

      if (strategy === 'replace') {
          updateState({ ...templateState, text: currentState.text });
      } else {
          // Merge Inteligente
          // Considera mídia do usuário apenas se for data URl ou blob (upload direto da galeria)
          const isUserMedia = currentState.backgroundStyle.type === 'media' && currentState.backgroundStyle.value !== '' && (currentState.backgroundStyle.value.startsWith('data:') || currentState.backgroundStyle.value.startsWith('blob:'));
          
          let nextBackgroundStyle = currentState.backgroundStyle;
          if (isUserMedia) {
             nextBackgroundStyle = currentState.backgroundStyle;
          } else if (templateState.backgroundStyle) {
             nextBackgroundStyle = templateState.backgroundStyle;
          } else if (currentState.backgroundStyle.type === 'media') {
             // Previne que a imagem de um template antigo vaze para um template que não possui fundo
             nextBackgroundStyle = { type: 'solid', value: '#000000' };
          } else {
             nextBackgroundStyle = currentState.backgroundStyle;
          }

          updateState({
              ...templateState,
              text: currentState.text,
              backgroundStyle: nextBackgroundStyle,
              // Preservar customizações de logo/assinatura
              showLogo: currentState.showLogo,
              logoOpacity: currentState.logoOpacity,
              logoPositionX: currentState.logoPositionX,
              logoPositionY: currentState.logoPositionY,
              logoScale: currentState.logoScale,
              showProfileSignature: currentState.showProfileSignature,
              signaturePositionX: currentState.signaturePositionX,
              signaturePositionY: currentState.signaturePositionY,
              signatureScale: currentState.signatureScale,
          });
      }
      toast({ title: "Modelo Aplicado!", description: "O estilo foi importado com sucesso." });
  }, [isReady, currentState, updateState, toast]);

  const undo = useCallback(() => { if (canUndo) setCurrentStateIndex(currentStateIndex - 1); }, [canUndo, currentStateIndex]);
  const redo = useCallback(() => { if (canRedo) setCurrentStateIndex(currentStateIndex + 1); }, [canRedo, currentStateIndex]);

  const onSaveAsTemplate = useCallback(async () => {
    if (!currentState || !profile) return;
    const templateName = prompt("Digite um nome para o novo modelo:");
    if (!templateName) return;

    const thumbnail = await captureThumbnail(toast, currentState, profile, baseTextStyle, textEffectsStyle, dropShadowStyle);
    if (!thumbnail) return;
    
    addTemplate(templateName, currentState, thumbnail);
    toast({ title: "Modelo Salvo!", description: `O modelo "${templateName}" foi adicionado.` });

  }, [addTemplate, currentState, toast, profile, baseTextStyle, textEffectsStyle, dropShadowStyle]);

  const onExportJPG = useCallback(() => {
      if(!currentState || !profile) return;
      captureAndDownload('jpeg', toast, currentState, profile, baseTextStyle, textEffectsStyle, dropShadowStyle);
  }, [toast, currentState, profile, baseTextStyle, textEffectsStyle, dropShadowStyle]);
  
  const onExportPNG = useCallback(() => {
      if(!currentState || !profile) return;
      captureAndDownload('png', toast, currentState, profile, baseTextStyle, textEffectsStyle, dropShadowStyle);
  }, [toast, currentState, profile, baseTextStyle, textEffectsStyle, dropShadowStyle]);

  const onExportMP4 = useCallback(async (options: ExportOptions, onProgress?: (p: number) => void): Promise<{ blob: Blob | null; error?: string }> => {
    if (!currentState || !profile) return { blob: null, error: 'Contexto ou perfil não encontrado' };
    return await generateVideoBlob(toast, currentState, profile, baseTextStyle, textEffectsStyle, dropShadowStyle, 0, options, onProgress);
  }, [toast, currentState, profile, baseTextStyle, textEffectsStyle, dropShadowStyle]);

  const value = useMemo(() => ({
    isReady,
    canUndo,
    canRedo,
    currentState,
    baseTextStyle,
    textEffectsStyle,
    dropShadowStyle,
    undo,
    redo,
    updateState,
    setInitialState,
    onSaveAsTemplate,
    onExportJPG,
    onExportPNG,
    onExportMP4,
    applyTemplate,
  }), [isReady, canUndo, canRedo, currentState, baseTextStyle, textEffectsStyle, dropShadowStyle, undo, redo, updateState, setInitialState, onSaveAsTemplate, onExportJPG, onExportPNG, onExportMP4, applyTemplate]);

  return (
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
}
