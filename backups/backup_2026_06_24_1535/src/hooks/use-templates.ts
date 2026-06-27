
"use client";

import { useState, useEffect, useCallback } from "react";
import { nanoid } from 'nanoid';
import type { EditorState } from "@/app/editor-de-video/tipos";

const TEMPLATES_KEY = "quotevid_templates";

export interface Template {
    id: string;
    name: string;
    editorState: Partial<EditorState>; // Salva o estado do editor
    isCustom: boolean; // Para diferenciar dos padrões
    thumbnail: string | null; // Preview do template
    createdAt?: string;
}

// Modelos padrão que não são editáveis pelo usuário
const defaultTemplatesData: Template[] = [
  { id: 'template-default', name: "Modelo Padrão", editorState: { fontSize: 1.0, showProfileSignature: true, showSignaturePhoto: true, signatureScale: 68, signaturePositionY: 90, aspectRatio: "9 / 16", activeTemplateId: 'template-default' }, isCustom: false, thumbnail: null },
  { id: 'template-twitter', name: "Post Twitter", editorState: { fontSize: 0.9, aspectRatio: "9 / 16", activeTemplateId: 'template-twitter', textShadowOpacity: 0 }, isCustom: false, thumbnail: null },
  { id: 'template-mountain', name: "Paisagem na Montanha", editorState: { fontSize: 1.0, aspectRatio: "9 / 16", backgroundStyle: { type: 'media', value: 'https://picsum.photos/id/1018/1080/1920' }, activeTemplateId: 'template-mountain', showProfileSignature: true, showSignaturePhoto: true, signatureScale: 68 }, isCustom: false, thumbnail: "https://picsum.photos/id/1018/400/400" },
];


export const useTemplates = () => {
    const [templates, setTemplates] = useState<Template[]>(() => {
        if (typeof window !== "undefined") {
            try {
                const storedTemplates = localStorage.getItem(TEMPLATES_KEY);
                const customTemplates = storedTemplates ? JSON.parse(storedTemplates) : [];
                return [...defaultTemplatesData, ...customTemplates];
            } catch (error) {
                console.error("Failed to parse templates from localStorage", error);
            }
        }
        return defaultTemplatesData;
    });
    const [isLoaded, setIsLoaded] = useState(() => {
        return typeof window !== "undefined";
    });

    const saveCustomTemplates = useCallback((customTemplates: Template[]) => {
        try {
            localStorage.setItem(TEMPLATES_KEY, JSON.stringify(customTemplates));
        } catch (error) {
            console.error("Failed to save templates to localStorage", error);
        }
    }, []);
    
    const addTemplate = useCallback((name: string, editorState: EditorState, thumbnail: string) => {
        const newTemplate: Template = {
            id: `custom-${nanoid()}`,
            name,
            // Filtra o estado para salvar apenas o necessário, excluindo texto, por exemplo
            editorState: { 
                ...editorState,
                text: '', // Não salva o texto no modelo
            },
            isCustom: true,
            thumbnail,
            createdAt: new Date().toISOString(),
        };

        setTemplates(prev => {
            const customTemplates = [...prev.filter(t => t.isCustom), newTemplate];
            saveCustomTemplates(customTemplates);
            return [...defaultTemplatesData, ...customTemplates];
        });
    }, [saveCustomTemplates]);

    const removeTemplate = useCallback((id: string) => {
        setTemplates(prev => {
            const updatedTemplates = prev.filter(t => t.id !== id);
            const customTemplates = updatedTemplates.filter(t => t.isCustom);
            saveCustomTemplates(customTemplates);
            return updatedTemplates;
        });
    }, [saveCustomTemplates]);

    const renameTemplate = useCallback((id: string, newName: string) => {
        setTemplates(prev => {
            const updatedTemplates = prev.map(t => t.id === id ? { ...t, name: newName } : t);
            const customTemplates = updatedTemplates.filter(t => t.isCustom);
            saveCustomTemplates(customTemplates);
            return updatedTemplates;
        })
    }, [saveCustomTemplates]);

    return { templates, addTemplate, removeTemplate, renameTemplate, isLoaded };
};
