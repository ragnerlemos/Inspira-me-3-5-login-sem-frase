"use client";

import { ChevronRight, SlidersHorizontal, Loader2, RefreshCw, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export interface FrasesHeaderProps {
    pageTitle: string;
    selectedMainCategory: string;
    selectedSubCategory: string;
    searchTerm: string;
    sortBy: 'recentes' | 'aleatorias' | 'antigas';
    isRefreshing: boolean;
    breadcrumbSubCategories: string[];
    onClearFilters: () => void;
    onSortChange: (sort: 'recentes' | 'aleatorias' | 'antigas') => void;
    onRefresh: () => void;
    onOpenMobileCategories: () => void;
    onSubCategorySelect: (main: string, sub: string) => void;
    onMainCategorySelect: (main: string) => void;
    onClearSearch: () => void;
}

export function FrasesHeader({
    pageTitle,
    selectedMainCategory,
    selectedSubCategory,
    searchTerm,
    sortBy,
    isRefreshing,
    breadcrumbSubCategories,
    onClearFilters,
    onSortChange,
    onRefresh,
    onOpenMobileCategories,
    onSubCategorySelect,
    onMainCategorySelect,
    onClearSearch
}: FrasesHeaderProps) {
    return (
        <>
            <div className="w-full mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="text-center md:text-left md:flex-1">
                    <h1 className="font-headline text-4xl md:text-5xl font-bold text-[var(--theme-title-color)]">
                        {pageTitle}
                    </h1>
                </div>
                <div className="flex flex-wrap items-center justify-center md:justify-end gap-2">
                    {(selectedMainCategory !== 'Todos' || selectedSubCategory !== 'Todos' || searchTerm !== '') && (
                        <Button
                            variant="default"
                            size="sm"
                            className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-9"
                            onClick={onClearFilters}
                        >
                            <ChevronRight className="mr-1 h-1.5 w-1.5 rotate-180" />
                            Voltar
                        </Button>
                    )}
                    
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="font-semibold flex items-center gap-1.5 h-9 bg-card hover:bg-accent border-muted/50">
                                <SlidersHorizontal className="h-4 w-4 text-primary" />
                                <span className="truncate">
                                    {sortBy === 'recentes' && 'Mais recentes'}
                                    {sortBy === 'aleatorias' && '🎲 Aleatórias'}
                                    {sortBy === 'antigas' && '📅 Mais antigas'}
                                </span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[180px] bg-popover text-popover-foreground border-border">
                            <DropdownMenuItem className={cn("cursor-pointer focus:bg-primary/10", sortBy === 'recentes' && "bg-secondary font-bold text-primary")} onClick={() => onSortChange('recentes')}>
                                🆕 Mais recentes
                            </DropdownMenuItem>
                            <DropdownMenuItem className={cn("cursor-pointer focus:bg-primary/10", sortBy === 'aleatorias' && "bg-secondary font-bold text-primary")} onClick={() => onSortChange('aleatorias')}>
                                🎲 Aleatórias
                            </DropdownMenuItem>
                            <DropdownMenuItem className={cn("cursor-pointer focus:bg-primary/10", sortBy === 'antigas' && "bg-secondary font-bold text-primary")} onClick={() => onSortChange('antigas')}>
                                📅 Mais antigas
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onRefresh}
                        disabled={isRefreshing}
                        className="h-9"
                    >
                        {isRefreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                        Atualizar
                    </Button>
                    <div className="md:hidden">
                        <Button variant="outline" size="icon" className="h-9 w-9" onClick={onOpenMobileCategories}>
                            <LayoutGrid className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>
            
            {(selectedMainCategory !== 'Todos' || selectedSubCategory !== 'Todos') && (
                <div className="flex items-center justify-between text-sm mb-6 bg-secondary/30 p-2 pl-3 rounded-lg">
                    <div className="flex items-center">
                        {selectedMainCategory !== 'Todos' ? (
                            <>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="link"
                                            className="p-0 h-auto font-semibold text-muted-foreground hover:text-primary"
                                        >
                                            {selectedMainCategory}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onClick={() => onSubCategorySelect(selectedMainCategory, 'Todos')}>
                                            Todos em {selectedMainCategory}
                                        </DropdownMenuItem>
                                        {breadcrumbSubCategories.map(subCat => (
                                            <DropdownMenuItem key={subCat} onClick={() => onSubCategorySelect(selectedMainCategory, subCat)}>
                                                {subCat}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                {selectedSubCategory !== 'Todos' && (
                                    <>
                                        <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />
                                        <span className="font-semibold text-foreground">{selectedSubCategory}</span>
                                    </>
                                )}
                            </>
                        ) : (
                            <span className="font-semibold text-foreground">Categoria: {selectedSubCategory}</span>
                        )}
                    </div>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
                        onClick={() => onMainCategorySelect('Todos')}
                    >
                        <ChevronRight className="h-5 w-5 rotate-180" />
                    </Button>
                </div>
            )}
            
            {selectedMainCategory === 'Todos' && searchTerm && (
                <div className="flex items-center text-sm mb-6 bg-secondary/30 p-2 rounded-lg">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mr-2 h-8 px-2"
                        onClick={onClearSearch}
                    >
                        <ChevronRight className="h-4 w-4 rotate-180 mr-1" />
                        Limpar Busca
                    </Button>
                    <span className="text-muted-foreground">Resultados para: </span>
                    <span className="font-semibold ml-1">"{searchTerm}"</span>
                </div>
            )}
        </>
    );
}
