
"use client";

import { useState, useEffect, useCallback } from "react";
import { nanoid } from 'nanoid';

const GALLERY_CATEGORIES_KEY = "quotevid_gallery_categories";
const GALLERY_MEDIA_ITEMS_KEY = "quotevid_gallery_media_items";
const GALLERY_SELECTED_CATEGORY_KEY = "quotevid_gallery_selected_category";

export interface GalleryCategory {
  id: string;
  name: string;
  isDefault?: boolean;
}

export interface MediaItem {
  id: string;
  categoryId: string;
  type: 'image' | 'video' | 'audio';
  src: string; // data URL
  name: string;
  aspectRatio: '9:16' | '16:9' | '1:1' | '4:5' | 'auto';
  isPinned: boolean;
  createdAt: string; // ISO date string
}

const defaultCategories: GalleryCategory[] = [
    { id: 'geral', name: 'Geral', isDefault: true },
    { id: 'favoritos', name: 'Favoritos', isDefault: true },
];

export const useGallery = () => {
    const [categories, setCategories] = useState<GalleryCategory[]>([]);
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Carregar dados do localStorage
    useEffect(() => {
        try {
            const storedCategories = localStorage.getItem(GALLERY_CATEGORIES_KEY);
            const storedMedia = localStorage.getItem(GALLERY_MEDIA_ITEMS_KEY);
            const storedSelected = localStorage.getItem(GALLERY_SELECTED_CATEGORY_KEY);

            const customCategories = storedCategories ? JSON.parse(storedCategories) : [];
            const loadedCategories = [...defaultCategories, ...customCategories];
            setCategories(loadedCategories);

            if (storedMedia) {
                setMediaItems(JSON.parse(storedMedia));
            }
            
            const initialSelected = storedSelected ? JSON.parse(storedSelected) : (loadedCategories[0]?.id || null);
            setSelectedCategory(initialSelected);

        } catch (error) {
            console.error("Failed to parse gallery data from localStorage", error);
            setCategories(defaultCategories);
            setSelectedCategory(defaultCategories[0]?.id || null);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    const getCustomCategories = useCallback((allCategories: GalleryCategory[]) => {
        return allCategories.filter(c => !c.isDefault);
    }, []);

    // Salvar categorias
    const saveCategories = useCallback((items: GalleryCategory[]) => {
        try {
            const customCategories = getCustomCategories(items);
            localStorage.setItem(GALLERY_CATEGORIES_KEY, JSON.stringify(customCategories));
        } catch (error) {
            console.error("Failed to save categories to localStorage", error);
        }
    }, [getCustomCategories]);

    // Salvar itens de mídia
    const saveMediaItems = useCallback((items: MediaItem[]) => {
        try {
            localStorage.setItem(GALLERY_MEDIA_ITEMS_KEY, JSON.stringify(items));
        } catch (error) {
            console.error("Failed to save media items to localStorage", error);
        }
    }, []);
    
    // Salvar categoria selecionada
    const handleSetSelectedCategory = useCallback((categoryId: string | null) => {
        try {
            if (categoryId) {
                localStorage.setItem(GALLERY_SELECTED_CATEGORY_KEY, JSON.stringify(categoryId));
            } else {
                localStorage.removeItem(GALLERY_SELECTED_CATEGORY_KEY);
            }
            setSelectedCategory(categoryId);
        } catch (error) {
            console.error("Failed to save selected category to localStorage", error);
        }
    }, []);

    // --- Funções de Gerenciamento ---

    const addCategory = useCallback((name: string) => {
        const newCategory: GalleryCategory = { id: nanoid(), name };
        setCategories(prev => {
            const updated = [...prev, newCategory];
            saveCategories(updated);
            handleSetSelectedCategory(newCategory.id); // Seleciona a nova categoria
            return updated;
        });
    }, [saveCategories, handleSetSelectedCategory]);

    const addMediaItem = useCallback((file: File, categoryId: string) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const src = e.target?.result as string;
            const type = file.type.startsWith('image') ? 'image' : file.type.startsWith('video') ? 'video' : 'audio';
            
            const newItem: MediaItem = {
                id: nanoid(),
                categoryId,
                type,
                src,
                name: file.name,
                aspectRatio: 'auto', 
                isPinned: false,
                createdAt: new Date().toISOString(),
            };
            
            setMediaItems(prev => {
                const updated = [newItem, ...prev];
                saveMediaItems(updated);
                return updated;
            });
        };
        reader.readAsDataURL(file);
    }, [saveMediaItems]);
    
    const renameCategory = useCallback((id: string, newName: string) => {
        setCategories(prev => {
            const updated = prev.map(c => c.id === id ? { ...c, name: newName } : c);
            saveCategories(updated);
            return updated;
        });
    }, [saveCategories]);

    const deleteCategory = useCallback((id: string) => {
        // Move as mídias da categoria excluída para 'Geral'
        setMediaItems(prevMedia => {
            const updatedMedia = prevMedia.map(item => 
                item.categoryId === id ? { ...item, categoryId: 'geral' } : item
            );
            saveMediaItems(updatedMedia);
            return updatedMedia;
        });
        
        // Remove a categoria
        setCategories(prevCategories => {
            const updatedCategories = prevCategories.filter(c => c.id !== id);
            saveCategories(updatedCategories);
            handleSetSelectedCategory('geral'); // Volta para a categoria geral
            return updatedCategories;
        });
    }, [saveCategories, saveMediaItems, handleSetSelectedCategory]);

    return { 
        isLoaded,
        categories, 
        addCategory,
        renameCategory,
        deleteCategory,
        mediaItems,
        addMediaItem,
        selectedCategory,
        setSelectedCategory: handleSetSelectedCategory,
    };
};
