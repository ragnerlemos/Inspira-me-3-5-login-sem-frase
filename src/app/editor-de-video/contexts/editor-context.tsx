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
  updateState: (newState: Partial<EditorState>, skipHistory?: boolean) => void;
  setInitialState: (initialState: EditorState) => void;
  onSaveAsTemplate: () => Promise<void>;
  onExportJPG: () => void;
  onExportPNG: () => void;
  onExportMP4: (options: ExportOptions, onProgress?: (p: number) => void) => Promise<{ blob: Blob | null; error?: string }>;
  applyTemplate: (templateState: Partial<EditorState>, strategy?: 'merge' | 'replace') => void;

  // Batch Properties
  batchPages: any[]; // EditorPage[]
  currentPageIndex: number;
  selectedPageIndices: number[];
  changesApplyScope: "current" | "all";
  batchCategory: string;
  batchSubCategory: string;
  
  // Batch Methods
  setBatchState: (state: Partial<{ batchPages: any[], currentPageIndex: number, selectedPageIndices: number[], changesApplyScope: "current" | "all" }>) => void;
  switchPage: (index: number) => void;
  duplicatePage: (index: number) => void;
  deletePage: (index: number) => void;
  reorderPages: (fromIndex: number, toIndex: number) => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);
const MAX_HISTORY_LENGTH = 100;

const cloneEditorState = (state: EditorState): EditorState => ({
  ...state,
  backgroundStyle: { ...state.backgroundStyle },
});

export function EditorProvider({ children }: { children: ReactNode }) {
  // Common states
  const [history, setHistory] = useState<EditorState[]>([]);
  const [currentStateIndex, setCurrentStateIndex] = useState(-1);
  const [isReady, setIsReady] = useState(false);

  // Batch states
  const [batchPages, setBatchPagesState] = useState<any[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [selectedPageIndices, setSelectedPageIndices] = useState<number[]>([0]);
  const [changesApplyScope, setChangesApplyScope] = useState<"current" | "all">("current");
  const [batchCategory, setBatchCategory] = useState<string>("Geral");
  const [batchSubCategory, setBatchSubCategory] = useState<string>("");
  const [pagesHistories, setPagesHistories] = useState<Record<number, { history: EditorState[], index: number }>>({});

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
    const stateWithDefaults = {
      ...initialState,
      logoZIndex: initialState.logoZIndex ?? 30,
      textZIndex: initialState.textZIndex ?? 20,
      signatureZIndex: initialState.signatureZIndex ?? 10,
      backgroundStyle: {
        ...initialState.backgroundStyle,
        blur: initialState.backgroundStyle.blur ?? 0,
        brightness: initialState.backgroundStyle.brightness ?? 100,
        contrast: initialState.backgroundStyle.contrast ?? 100,
        grayscale: initialState.backgroundStyle.grayscale ?? 0,
        sepia: initialState.backgroundStyle.sepia ?? 0,
        hueRotate: initialState.backgroundStyle.hueRotate ?? 0,
      }
    };
    const initialSnapshot = cloneEditorState(stateWithDefaults);
    setHistory([initialSnapshot]);
    setCurrentStateIndex(0);
    setIsReady(true);
  }, []);

  const updateState = useCallback((newState: Partial<EditorState>, skipHistory = false) => {
    if (!isReady || !currentState) return;

    const nextState = cloneEditorState({ ...currentState, ...newState });

    const updateHistoriesAndPages = (newHistoryCb: (prev: EditorState[]) => EditorState[]) => {
      let finalNextHistory: EditorState[] = [];
      let finalNextIndex = -1;

      setHistory((prevHistory) => {
         finalNextHistory = newHistoryCb(prevHistory);
         finalNextIndex = skipHistory ? Math.min(Math.max(currentStateIndex, 0), finalNextHistory.length - 1) : finalNextHistory.length - 1;
         return finalNextHistory;
      });
      setCurrentStateIndex(prev => skipHistory ? Math.min(Math.max(prev, 0), finalNextHistory.length - 1) : finalNextHistory.length - 1);

      setBatchPagesState(prevPages => {
        if (prevPages.length === 0) return prevPages;
        
        const isStyleUpdate = Object.keys(newState).some(k => k !== 'text');
        
        if (changesApplyScope === 'all' && isStyleUpdate) {
            const styleChanges = { ...newState };
            delete styleChanges.text;

            const nextPages = prevPages.map((p, i) => {
                if (i === currentPageIndex) return { ...p, ...newState };
                return { ...p, ...styleChanges };
            });

            setPagesHistories(prevHistories => {
                const nextHistories = { ...prevHistories };
                for (let i = 0; i < nextPages.length; i++) {
                    if (i === currentPageIndex) {
                       nextHistories[i] = { history: finalNextHistory, index: finalNextIndex };
                       continue;
                    }
                    if (!nextHistories[i]) continue;
                    
                    const pHist = nextHistories[i];
                    if(skipHistory) {
                        const pNewHistory = [...pHist.history];
                        const pSafeIndex = Math.min(Math.max(pHist.index, 0), pNewHistory.length - 1);
                        pNewHistory[pSafeIndex] = cloneEditorState({ ...pNewHistory[pSafeIndex], ...styleChanges });
                        nextHistories[i] = { ...pHist, history: pNewHistory };
                    } else {
                        const pBaseHistory = pHist.history.slice(0, pHist.index + 1);
                        const pNextState = cloneEditorState({ ...pBaseHistory[pBaseHistory.length - 1], ...styleChanges });
                        const pNextHistory = [...pBaseHistory, pNextState].slice(-MAX_HISTORY_LENGTH);
                        nextHistories[i] = { history: pNextHistory, index: pNextHistory.length - 1 };
                    }
                }
                return nextHistories;
            });
            return nextPages;
        } else {
            const nextPages = [...prevPages];
            nextPages[currentPageIndex] = { ...nextPages[currentPageIndex], ...newState };
            
            setPagesHistories(prevHistories => ({
                ...prevHistories,
                [currentPageIndex]: { history: finalNextHistory, index: finalNextIndex }
            }));
            
            return nextPages;
        }
      });
    };

    if (skipHistory) {
      updateHistoriesAndPages((prevHistory) => {
        if (prevHistory.length === 0) return [nextState];
        const newHistory = [...prevHistory];
        const safeIndex = Math.min(Math.max(currentStateIndex, 0), newHistory.length - 1);
        newHistory[safeIndex] = nextState;
        return newHistory;
      });
      return;
    }

    updateHistoriesAndPages((prevHistory) => {
      const baseHistory = prevHistory.slice(0, currentStateIndex + 1);
      const nextHistory = [...baseHistory, nextState];
      return nextHistory.slice(-MAX_HISTORY_LENGTH);
    });

  }, [isReady, currentState, currentStateIndex, changesApplyScope, currentPageIndex]);

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

  const undo = useCallback(() => {
    if (!canUndo) return;
    setCurrentStateIndex((prevIndex) => prevIndex - 1);
  }, [canUndo]);

  const redo = useCallback(() => {
    if (!canRedo) return;
    setCurrentStateIndex((prevIndex) => prevIndex + 1);
  }, [canRedo]);

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

  const setBatchState = useCallback((state: Partial<{ 
    batchPages: any[], 
    currentPageIndex: number, 
    selectedPageIndices: number[], 
    changesApplyScope: "current" | "all",
    batchCategory: string,
    batchSubCategory: string
  }>) => {
    if (state.batchPages !== undefined) {
      setBatchPagesState(state.batchPages);
      // Initialize histories for these pages
      const newHistories: Record<number, { history: EditorState[], index: number }> = {};
      state.batchPages.forEach((p, i) => {
        newHistories[i] = { history: [cloneEditorState(p)], index: 0 };
      });
      setPagesHistories(newHistories);
      
      const idx = state.currentPageIndex ?? 0;
      setCurrentPageIndex(idx);
      if (state.batchPages.length > 0) {
        setHistory([cloneEditorState(state.batchPages[idx])]);
        setCurrentStateIndex(0);
      }
    } else if (state.currentPageIndex !== undefined) {
        // Handled by switchPage conceptually, but we can do it here if needed
        setCurrentPageIndex(state.currentPageIndex);
    }
    
    if (state.selectedPageIndices !== undefined) setSelectedPageIndices(state.selectedPageIndices);
    if (state.changesApplyScope !== undefined) setChangesApplyScope(state.changesApplyScope);
    if (state.batchCategory !== undefined) setBatchCategory(state.batchCategory);
    if (state.batchSubCategory !== undefined) setBatchSubCategory(state.batchSubCategory);
  }, []);

  const switchPage = useCallback((index: number) => {
    if (index === currentPageIndex || !batchPages[index]) return;
    
    // Save current history explicitly just in case, though it's managed via setPagesHistories in updateState
    // Load new page history
    if (pagesHistories[index]) {
      setHistory(pagesHistories[index].history);
      setCurrentStateIndex(pagesHistories[index].index);
    } else {
      const initialState = cloneEditorState(batchPages[index]);
      setHistory([initialState]);
      setCurrentStateIndex(0);
    }
    setCurrentPageIndex(index);
    // Auto-select the switched page if it wasn't selected
    setSelectedPageIndices([index]);
  }, [currentPageIndex, batchPages, pagesHistories]);

  const duplicatePage = useCallback((index: number) => {
    setBatchPagesState(prev => {
        const next = [...prev];
        const duplicated = { ...next[index] };
        next.splice(index + 1, 0, duplicated);
        return next;
    });
    setPagesHistories(prev => {
        const next = { ...prev };
        // Shift histories
        for(let i = Object.keys(next).length - 1; i > index; i--) {
            next[i + 1] = next[i];
        }
        next[index + 1] = { history: [cloneEditorState(batchPages[index])], index: 0 };
        return next;
    });
  }, [batchPages]);

  const deletePage = useCallback((index: number) => {
    setBatchPagesState(prev => prev.filter((_, i) => i !== index));
    setPagesHistories(prev => {
        const next = { ...prev };
        delete next[index];
        // Shift histories back
        for(let i = index + 1; i <= Object.keys(next).length; i++) {
            if (next[i]) {
                next[i - 1] = next[i];
                delete next[i];
            }
        }
        return next;
    });
    if (currentPageIndex === index) {
        switchPage(Math.max(0, index - 1));
    } else if (currentPageIndex > index) {
        setCurrentPageIndex(currentPageIndex - 1);
    }
  }, [currentPageIndex, switchPage]);

  const reorderPages = useCallback((fromIndex: number, toIndex: number) => {
      setBatchPagesState(prev => {
          const next = [...prev];
          const [moved] = next.splice(fromIndex, 1);
          next.splice(toIndex, 0, moved);
          return next;
      });
      setPagesHistories(prev => {
          const next = { ...prev };
          const moved = next[fromIndex];
          // Simple rebuild of histories based on new order
          // This is a bit complex, easier to just swap or shift
          // For now, let's just shift them
          if (fromIndex < toIndex) {
              for (let i = fromIndex; i < toIndex; i++) {
                  next[i] = next[i + 1];
              }
          } else {
              for (let i = fromIndex; i > toIndex; i--) {
                  next[i] = next[i - 1];
              }
          }
          next[toIndex] = moved;
          return next;
      });
      if (currentPageIndex === fromIndex) {
          setCurrentPageIndex(toIndex);
      } else if (currentPageIndex > fromIndex && currentPageIndex <= toIndex) {
          setCurrentPageIndex(currentPageIndex - 1);
      } else if (currentPageIndex < fromIndex && currentPageIndex >= toIndex) {
          setCurrentPageIndex(currentPageIndex + 1);
      }
  }, [currentPageIndex]);

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
    batchPages,
    currentPageIndex,
    selectedPageIndices,
    changesApplyScope,
    batchCategory,
    batchSubCategory,
    setBatchState,
    switchPage,
    duplicatePage,
    deletePage,
    reorderPages
  }), [isReady, canUndo, canRedo, currentState, baseTextStyle, textEffectsStyle, dropShadowStyle, undo, redo, updateState, setInitialState, onSaveAsTemplate, onExportJPG, onExportPNG, onExportMP4, applyTemplate, batchPages, currentPageIndex, selectedPageIndices, changesApplyScope, batchCategory, batchSubCategory, setBatchState, switchPage, duplicatePage, deletePage, reorderPages]);

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
