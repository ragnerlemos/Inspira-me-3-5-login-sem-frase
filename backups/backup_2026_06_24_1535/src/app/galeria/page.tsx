
"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreVertical, Edit, Trash2, Library } from "lucide-react";
import { useGallery } from "@/hooks/use-gallery";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

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
    
    const [categoryName, setCategoryName] = useState("");
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
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

    const handleAddCategory = () => {
        if (categoryName.trim()) {
            addCategory(categoryName.trim());
            toast({ title: "Categoria Criada!", description: `A categoria "${categoryName.trim()}" foi adicionada.` });
            setCategoryName("");
            setIsAddDialogOpen(false);
        }
    };
    
    const handleRenameCategory = () => {
        if (categoryName.trim() && selectedCategory) {
            renameCategory(selectedCategory, categoryName.trim());
            toast({ title: "Categoria Renomeada!", description: `A categoria foi renomeada para "${categoryName.trim()}".` });
            setCategoryName("");
            setIsRenameDialogOpen(false);
        }
    };

    const handleDeleteCategory = () => {
        if (selectedCategory) {
            const defaultCategory = categories.find(c => c.isDefault);
            deleteCategory(selectedCategory);
            setSelectedCategory(defaultCategory ? defaultCategory.id : null);
            toast({ title: "Categoria Excluída!", description: "A categoria foi removida com sucesso." });
            setIsDeleteDialogOpen(false);
        }
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
    
    const selectedCategoryDetails = categories.find(c => c.id === selectedCategory);
    const isDefaultCategorySelected = selectedCategoryDetails?.isDefault ?? false;

    const mediaForSelectedCategory = mediaItems.filter(item => item.categoryId === selectedCategory);

    return (
        <main className="overflow-y-auto">
            <div className="container mx-auto py-8 px-4">
                 <div className="text-center mb-8">
                    <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">Galeria de Mídia</h1>
                    <p className="text-muted-foreground mt-2 text-lg">Suas imagens, vídeos e áudios em um só lugar.</p>
                </div>
                <Card className="mb-8">
                    <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex-1 w-full">
                            <Select value={selectedCategory || ""} onValueChange={(value) => setSelectedCategory(value || null)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione uma categoria" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(category => (
                                        <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-2">
                             <AlertDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                                <AlertDialogTrigger asChild>
                                    <Button onClick={() => setCategoryName('')}>
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Nova Categoria
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Criar Nova Categoria</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Digite um nome para a sua nova categoria de mídia.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <div className="py-2">
                                        <Label htmlFor="category-name" className="sr-only">Nome da Categoria</Label>
                                        <Input id="category-name" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="Ex: Vídeos de Natureza" />
                                    </div>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleAddCategory}>Criar</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>

                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" disabled={!selectedCategory}>
                                        <MoreVertical className="h-5 w-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <AlertDialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
                                        <AlertDialogTrigger asChild>
                                             <button className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full disabled:cursor-not-allowed" disabled={isDefaultCategorySelected} onClick={() => setCategoryName(selectedCategoryDetails?.name || '')}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Renomear
                                            </button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Renomear Categoria</AlertDialogTitle>
                                                <AlertDialogDescription>Digite o novo nome para a categoria "{selectedCategoryDetails?.name}".</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <div className="py-2">
                                                <Label htmlFor="rename-category-name" className="sr-only">Novo Nome</Label>
                                                <Input id="rename-category-name" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="Novo nome..." />
                                            </div>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction onClick={handleRenameCategory}>Salvar</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                     <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                                        <AlertDialogTrigger asChild>
                                            <button className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full text-destructive" disabled={isDefaultCategorySelected}>
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Excluir Categoria
                                            </button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Esta ação não pode ser desfeita. Todos os itens de mídia nesta categoria serão movidos para "Geral".
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction onClick={handleDeleteCategory}>Excluir</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </CardContent>
                </Card>
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
                            <Card key={item.id}>
                                <CardContent className="p-2">
                                    <div className="aspect-square bg-muted rounded-md flex items-center justify-center">
                                        {item.type === 'image' && <img src={item.src} alt={item.name} className="object-cover w-full h-full rounded-md" />}
                                        {item.type === 'video' && <video src={item.src} className="object-cover w-full h-full rounded-md" />}
                                        {item.type === 'audio' && <Library className="h-10 w-10 text-muted-foreground" />}
                                    </div>
                                    <p className="text-sm truncate mt-2">{item.name}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-card border rounded-lg flex flex-col items-center">
                        <Library className="h-16 w-16 text-muted-foreground/50 mb-4" />
                        <h2 className="text-2xl font-semibold mb-2">Nenhuma mídia nesta categoria</h2>
                        <p className="text-muted-foreground mb-6">
                            Adicione imagens, vídeos ou áudios para começar a organizar sua galeria.
                        </p>
                        <Button 
                            variant="outline" 
                            disabled={!selectedCategory}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Adicionar Mídia
                        </Button>
                    </div>
                )}
            </div>
        </main>
    );
}
