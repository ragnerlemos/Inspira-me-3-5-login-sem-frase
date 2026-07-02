
"use client";

import { useRef, useEffect } from 'react';
import { useGallery } from "@/hooks/use-gallery";
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { useToast } from '@/hooks/use-toast';
import { GalleryHeader } from './components/gallery-header';
import { GalleryCategoryManager } from './components/gallery-category-manager';
import { GalleryItem } from './components/gallery-item';
import { GalleryEmpty } from './components/gallery-empty';

// Página para exibir e gerenciar a galeria de mídias do usuário.
export default function GalleryPage() {
    const { 
        categories, 
        addCategory, 
        renameCategory,
        deleteCategory,
        mediaItems, 
        addMediaItem,
        selectedCategory, 
        setSelectedCategory 
    } = useGallery();
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Handle hardware back button on mobile
    useEffect(() => {
        if (!Capacitor.isNativePlatform()) return;

        const setupBackListener = async () => {
            const backListener = await App.addListener('backButton', () => {
                if (selectedCategory) {
                    const defaultCategory = categories.find(c => c.isDefault);
                    setSelectedCategory(defaultCategory ? defaultCategory.id : null);
                }
            });
            return backListener;
        };

        const listenerPromise = setupBackListener();

        return () => {
            listenerPromise.then(l => l.remove());
        };
    }, [selectedCategory, categories, setSelectedCategory]);

    const handleAddCategory = (name: string) => {
        addCategory(name);
        toast({ title: "Categoria Criada!", description: `A categoria "${name}" foi adicionada.` });
    };
    
    const handleRenameCategory = (id: string, newName: string) => {
        renameCategory(id, newName);
        toast({ title: "Categoria Renomeada!", description: `A categoria foi renomeada para "${newName}".` });
    };

    const handleDeleteCategory = (id: string) => {
        const defaultCategory = categories.find(c => c.isDefault);
        deleteCategory(id);
        setSelectedCategory(defaultCategory ? defaultCategory.id : null);
        toast({ title: "Categoria Excluída!", description: "A categoria foi removida com sucesso." });
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !selectedCategory) return;
        
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/') && !file.type.startsWith('audio/')) {
            toast({ variant: "destructive", title: "Arquivo Inválido", description: "Por favor, selecione um arquivo de imagem, vídeo ou áudio." });
            return;
        }
        
        addMediaItem(file, selectedCategory);
        toast({ title: "Mídia Adicionada!", description: `O arquivo ${file.name} foi adicionado à galeria.` });
    };
    
    const mediaForSelectedCategory = mediaItems.filter(item => item.categoryId === selectedCategory);

    return (
        <main className="overflow-y-auto">
            <div className="container mx-auto py-8 px-4">
                <GalleryHeader />
                
                <GalleryCategoryManager 
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                    onAddCategory={handleAddCategory}
                    onRenameCategory={handleRenameCategory}
                    onDeleteCategory={handleDeleteCategory}
                />

                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept="image/*,video/*,audio/*"
                />

                {mediaForSelectedCategory.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {mediaForSelectedCategory.map(item => (
                            <GalleryItem key={item.id} item={item} />
                        ))}
                    </div>
                ) : (
                    <GalleryEmpty 
                        onAddClick={() => fileInputRef.current?.click()} 
                        disabled={!selectedCategory}
                    />
                )}
            </div>
        </main>
    );
}

