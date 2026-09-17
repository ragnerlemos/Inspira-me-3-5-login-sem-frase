
"use client";

import { useRef, useEffect, useState } from 'react';
import { useGallery } from "@/hooks/use-gallery";
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { useToast } from '@/hooks/use-toast';
import { GalleryHeader } from './components/gallery-header';
import { GalleryCategoryManager } from './components/gallery-category-manager';
import { GalleryItem } from './components/gallery-item';
import { GalleryEmpty } from './components/gallery-empty';
import { Button } from '@/components/ui/button';
import { List, Grid2X2, Grid3X3, Columns4 } from 'lucide-react';
import { cn } from '@/lib/utils';

type ViewMode = 'list' | '2' | '3' | '4';

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
    const [viewMode, setViewMode] = useState<ViewMode>('4');

    useEffect(() => {
        const savedMode = localStorage.getItem('galeria_view_mode') as ViewMode | null;
        if (savedMode && ['list', '2', '3', '4'].includes(savedMode)) {
            setViewMode(savedMode);
        }
    }, []);

    const handleViewModeChange = (mode: ViewMode) => {
        setViewMode(mode);
        localStorage.setItem('galeria_view_mode', mode);
    };

    const getGridClassName = () => {
        switch (viewMode) {
            case 'list':
                return 'flex flex-col gap-3';
            case '2':
                return 'grid grid-cols-2 gap-3 sm:gap-4';
            case '3':
                return 'grid grid-cols-3 gap-2 sm:gap-4';
            case '4':
            default:
                return 'grid grid-cols-4 gap-2 sm:gap-3';
        }
    };
    
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
                    <div className="space-y-4">
                        <div className="flex items-center justify-between gap-3 pt-2">
                            <span className="text-sm text-muted-foreground font-medium">
                                {mediaForSelectedCategory.length} {mediaForSelectedCategory.length === 1 ? 'item' : 'itens'}
                            </span>
                            <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border/50">
                                <Button
                                    type="button"
                                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    className={cn("h-7 px-2 text-xs gap-1.5", viewMode === 'list' && "bg-background shadow-xs font-medium text-foreground")}
                                    onClick={() => handleViewModeChange('list')}
                                    title="Visualização em Lista"
                                >
                                    <List className="h-3.5 w-3.5" />
                                    <span className="hidden sm:inline">Lista</span>
                                </Button>
                                <Button
                                    type="button"
                                    variant={viewMode === '2' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    className={cn("h-7 px-2 text-xs gap-1.5", viewMode === '2' && "bg-background shadow-xs font-medium text-foreground")}
                                    onClick={() => handleViewModeChange('2')}
                                    title="2 Colunas"
                                >
                                    <Grid2X2 className="h-3.5 w-3.5" />
                                    <span>2 Col</span>
                                </Button>
                                <Button
                                    type="button"
                                    variant={viewMode === '3' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    className={cn("h-7 px-2 text-xs gap-1.5", viewMode === '3' && "bg-background shadow-xs font-medium text-foreground")}
                                    onClick={() => handleViewModeChange('3')}
                                    title="3 Colunas"
                                >
                                    <Grid3X3 className="h-3.5 w-3.5" />
                                    <span>3 Col</span>
                                </Button>
                                <Button
                                    type="button"
                                    variant={viewMode === '4' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    className={cn("h-7 px-2 text-xs gap-1.5", viewMode === '4' && "bg-background shadow-xs font-medium text-foreground")}
                                    onClick={() => handleViewModeChange('4')}
                                    title="4 Colunas"
                                >
                                    <Columns4 className="h-3.5 w-3.5" />
                                    <span>4 Col</span>
                                </Button>
                            </div>
                        </div>

                        <div className={getGridClassName()}>
                            {mediaForSelectedCategory.map(item => (
                                <GalleryItem key={item.id} item={item} viewMode={viewMode} />
                            ))}
                        </div>
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

