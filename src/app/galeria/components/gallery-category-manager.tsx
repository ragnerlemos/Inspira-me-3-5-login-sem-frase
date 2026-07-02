"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreVertical, Edit, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

interface Category {
    id: string;
    name: string;
    isDefault?: boolean;
}

interface GalleryCategoryManagerProps {
    categories: Category[];
    selectedCategory: string | null;
    onSelectCategory: (id: string | null) => void;
    onAddCategory: (name: string) => void;
    onRenameCategory: (id: string, newName: string) => void;
    onDeleteCategory: (id: string) => void;
}

export function GalleryCategoryManager({
    categories,
    selectedCategory,
    onSelectCategory,
    onAddCategory,
    onRenameCategory,
    onDeleteCategory
}: GalleryCategoryManagerProps) {
    const [categoryName, setCategoryName] = useState("");
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const selectedCategoryDetails = categories.find(c => c.id === selectedCategory);
    const isDefaultCategorySelected = selectedCategoryDetails?.isDefault ?? false;

    const handleAdd = () => {
        if (categoryName.trim()) {
            onAddCategory(categoryName.trim());
            setCategoryName("");
            setIsAddDialogOpen(false);
        }
    };

    const handleRename = () => {
        if (categoryName.trim() && selectedCategory) {
            onRenameCategory(selectedCategory, categoryName.trim());
            setCategoryName("");
            setIsRenameDialogOpen(false);
        }
    };

    const handleDelete = () => {
        if (selectedCategory) {
            onDeleteCategory(selectedCategory);
            setIsDeleteDialogOpen(false);
        }
    };

    return (
        <Card className="mb-8">
            <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex-1 w-full">
                    <Select value={selectedCategory || ""} onValueChange={(value) => onSelectCategory(value || null)}>
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
                                <AlertDialogAction onClick={handleAdd}>Criar</AlertDialogAction>
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
                                    <button 
                                        className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full disabled:cursor-not-allowed" 
                                        disabled={isDefaultCategorySelected} 
                                        onClick={() => setCategoryName(selectedCategoryDetails?.name || '')}
                                    >
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
                                        <AlertDialogAction onClick={handleRename}>Salvar</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                                <AlertDialogTrigger asChild>
                                    <button 
                                        className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full text-destructive" 
                                        disabled={isDefaultCategorySelected}
                                    >
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
                                        <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardContent>
        </Card>
    );
}
