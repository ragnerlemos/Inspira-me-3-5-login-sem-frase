"use client";

import { ChevronRight, ChevronDown, SlidersHorizontal, Loader2, RefreshCw, LayoutGrid, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export interface FrasesHeaderProps {
    pageTitle: string;
    selectedMainCategory: string;
    selectedSubCategory: string;
    selectedSubSubCategory: string;
    searchTerm: string;
    sortBy: 'recentes' | 'aleatorias' | 'antigas';
    isRefreshing: boolean;
    breadcrumbSubCategories: string[];
    breadcrumbSubSubCategories: string[];
    availableSubCategories?: { name: string; count?: number }[];
    subCategoryOptions?: { name: string; count?: number }[];
    mainCategories?: string[];
    initialMainCategories?: string[];
    onClearFilters: () => void;
    onSortChange: (sort: 'recentes' | 'aleatorias' | 'antigas') => void;
    onRefresh: () => void;
    onOpenMobileCategories: () => void;
    onSubCategorySelect: (main: string, sub: string) => void;
    onSubSubCategorySelect: (main: string, sub: string, subSub: string) => void;
    onMainCategorySelect: (main: string) => void;
    onClearSearch: () => void;
    onSearchChange: (term: string) => void;
}

export function FrasesHeader({
    pageTitle,
    selectedMainCategory,
    selectedSubCategory,
    selectedSubSubCategory,
    searchTerm,
    sortBy,
    isRefreshing,
    breadcrumbSubCategories,
    breadcrumbSubSubCategories,
    availableSubCategories = [],
    subCategoryOptions = [],
    mainCategories = [],
    initialMainCategories = [],
    onClearFilters,
    onSortChange,
    onRefresh,
    onOpenMobileCategories,
    onSubCategorySelect,
    onSubSubCategorySelect,
    onMainCategorySelect,
    onClearSearch,
    onSearchChange
}: FrasesHeaderProps) {
    const rawCategories = (mainCategories && mainCategories.length > 0)
        ? mainCategories
        : ((initialMainCategories && initialMainCategories.length > 0)
            ? initialMainCategories
            : ['Todos', 'Trends', 'Frases', 'Dias da Semana', 'Datas Comemorativas']);

    const categoriesList = rawCategories.some(c => c.toLowerCase() === 'todos')
        ? rawCategories
        : ['Todos', ...rawCategories];

    const displayMainCategory = categoriesList.find(c => c.toLowerCase().trim() === selectedMainCategory.toLowerCase().trim()) || selectedMainCategory;

    const hasActiveFilters = selectedMainCategory.toLowerCase() !== 'todos' || selectedSubCategory.toLowerCase() !== 'todos' || selectedSubSubCategory.toLowerCase() !== 'todos' || searchTerm !== '';
    const showSubSubCategoryDropdown = selectedSubSubCategory.toLowerCase() !== 'todos';

    const subCategoriesToDisplay = (availableSubCategories && availableSubCategories.length > 0)
        ? availableSubCategories
        : (breadcrumbSubCategories && breadcrumbSubCategories.length > 0)
            ? breadcrumbSubCategories.map(s => ({ name: s }))
            : [];
    return (
        <>
            <div className="w-full mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="text-center md:text-left md:flex-1">
                    <h1 className="font-headline text-4xl md:text-5xl font-bold text-[var(--theme-title-color)]">
                        {pageTitle}
                    </h1>
                </div>
                <div className="flex flex-wrap items-center justify-center md:justify-end gap-2">
                    <div className="relative flex-1 md:flex-initial min-w-[120px]">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="h-9 w-full md:w-[180px] pl-8 pr-8 bg-card border-muted/50 text-sm focus-visible:ring-1 focus-visible:ring-primary"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => onSearchChange('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground flex items-center justify-center rounded-full focus:outline-none"
                                title="Limpar busca"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>
                    
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="font-semibold flex items-center justify-center h-9 w-9 bg-card hover:bg-accent border-muted/50 p-0" title="Ordenar frases">
                                <SlidersHorizontal className="h-4 w-4 text-primary" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[180px] bg-popover text-popover-foreground border-border">
                            <DropdownMenuItem className={cn("cursor-pointer focus:bg-primary/10", sortBy === 'recentes' && "bg-secondary font-bold text-primary")} onSelect={() => onSortChange('recentes')} onClick={() => onSortChange('recentes')}>
                                🆕 Mais recentes
                            </DropdownMenuItem>
                            <DropdownMenuItem className={cn("cursor-pointer focus:bg-primary/10", sortBy === 'aleatorias' && "bg-secondary font-bold text-primary")} onSelect={() => onSortChange('aleatorias')} onClick={() => onSortChange('aleatorias')}>
                                🎲 Aleatórias
                            </DropdownMenuItem>
                            <DropdownMenuItem className={cn("cursor-pointer focus:bg-primary/10", sortBy === 'antigas' && "bg-secondary font-bold text-primary")} onSelect={() => onSortChange('antigas')} onClick={() => onSortChange('antigas')}>
                                📅 Mais antigas
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={onRefresh}
                        disabled={isRefreshing}
                        className="h-9 w-9 p-0"
                        title="Atualizar"
                    >
                        {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    </Button>
                    <div className="md:hidden">
                        <Button variant="outline" size="icon" className="h-9 w-9" onClick={onOpenMobileCategories}>
                            <LayoutGrid className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>
            
            {/* Barra de Navegação de Categorias / Breadcrumbs - Visível na página inicial e durante a navegação */}
            <div className="flex flex-row items-start text-xs mb-6 bg-secondary/30 p-1.5 rounded-lg w-full gap-1.5">
                
                {/* Coluna 1: Categoria */}
                <div className="flex flex-col gap-0 w-full min-w-0 flex-1">
                    <span className="text-[9px] uppercase font-semibold text-muted-foreground px-1.5 tracking-wider">Categoria</span>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-1.5 text-xs font-bold text-primary hover:text-primary hover:bg-primary/10 gap-1 capitalize active:scale-95 transition-transform duration-100 select-none cursor-pointer w-full justify-between"
                            >
                                <span className="truncate">{displayMainCategory}</span>
                                <ChevronDown className="h-3 w-3 opacity-70 shrink-0" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56 max-h-72 overflow-y-auto bg-popover text-popover-foreground border-border shadow-lg">
                            {categoriesList.map(cat => (
                                <DropdownMenuItem 
                                    key={cat} 
                                    className={cn(
                                        "cursor-pointer flex items-center justify-between capitalize text-xs",
                                        selectedMainCategory.toLowerCase().trim() === cat.toLowerCase().trim() && "bg-primary/10 text-primary font-bold"
                                    )}
                                    onSelect={() => onMainCategorySelect(cat)}
                                    onClick={() => onMainCategorySelect(cat)}
                                >
                                    <span className="truncate">{cat}</span>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Coluna 2: Subcategoria */}
                <div className="flex flex-col gap-0 w-full min-w-0 flex-1">
                    <span className="text-[9px] uppercase font-semibold text-muted-foreground px-1.5 tracking-wider">Subcategoria</span>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-1.5 text-xs font-bold text-primary hover:text-primary hover:bg-primary/10 gap-1 capitalize active:scale-95 transition-transform duration-100 select-none cursor-pointer w-full justify-between"
                            >
                                <span className="truncate">{selectedSubCategory}</span>
                                <ChevronDown className="h-3 w-3 opacity-70 shrink-0" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-60 max-h-72 overflow-y-auto bg-popover text-popover-foreground border-border shadow-lg">
                            <DropdownMenuItem 
                                className={cn("cursor-pointer font-medium text-xs", selectedSubCategory.toLowerCase() === 'todos' && "bg-primary/10 text-primary font-bold")}
                                onSelect={() => onSubCategorySelect(selectedMainCategory, 'Todos')}
                                onClick={() => onSubCategorySelect(selectedMainCategory, 'Todos')}
                            >
                                {selectedMainCategory.toLowerCase() !== 'todos' ? `Todas em ${displayMainCategory}` : 'Todas as Subcategorias'}
                            </DropdownMenuItem>
                            {subCategoriesToDisplay.map(opt => (
                                <DropdownMenuItem 
                                    key={opt.name} 
                                    className={cn(
                                        "cursor-pointer flex items-center justify-between text-xs",
                                        selectedSubCategory.toLowerCase().trim() === opt.name.toLowerCase().trim() && "bg-primary/10 text-primary font-bold"
                                    )}
                                    onSelect={() => onSubCategorySelect(selectedMainCategory, opt.name)}
                                    onClick={() => onSubCategorySelect(selectedMainCategory, opt.name)}
                                >
                                    <span className="capitalize truncate">{opt.name}</span>
                                    {opt.count !== undefined && (
                                        <span className="text-[10px] text-muted-foreground ml-2 font-semibold shrink-0">({opt.count})</span>
                                    )}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Coluna 3: Sub-subcategoria (Opcional) */}
                {showSubSubCategoryDropdown && (
                    <div className="flex flex-col gap-0 w-full min-w-0 flex-1">
                        <span className="text-[9px] uppercase font-semibold text-muted-foreground px-1.5 tracking-wider">Mais</span>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-1.5 text-xs font-bold text-primary hover:text-primary hover:bg-primary/10 gap-1 capitalize active:scale-95 transition-transform duration-100 select-none cursor-pointer w-full justify-between"
                                >
                                    <span className="truncate">{selectedSubSubCategory}</span>
                                    <ChevronDown className="h-3 w-3 opacity-70 shrink-0" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-56 max-h-72 overflow-y-auto bg-popover text-popover-foreground border-border shadow-lg">
                                <DropdownMenuItem 
                                    className="cursor-pointer font-medium text-xs"
                                    onSelect={() => onSubCategorySelect(selectedMainCategory, selectedSubCategory)}
                                    onClick={() => onSubCategorySelect(selectedMainCategory, selectedSubCategory)}
                                >
                                    Todas em {selectedSubCategory}
                                </DropdownMenuItem>
                                {(subCategoryOptions && subCategoryOptions.length > 0 ? subCategoryOptions : breadcrumbSubSubCategories.map(s => ({ name: s }))).map(opt => (
                                    <DropdownMenuItem 
                                        key={opt.name} 
                                        className={cn("cursor-pointer flex items-center justify-between text-xs", selectedSubSubCategory.toLowerCase() === opt.name.toLowerCase() && "bg-primary/10 text-primary font-bold")}
                                        onSelect={() => onSubSubCategorySelect(selectedMainCategory, selectedSubCategory, opt.name)}
                                        onClick={() => onSubSubCategorySelect(selectedMainCategory, selectedSubCategory, opt.name)}
                                    >
                                        <span className="capitalize truncate">{opt.name}</span>
                                        {opt.count !== undefined && (
                                            <span className="text-[10px] text-muted-foreground ml-2 font-semibold shrink-0">({opt.count})</span>
                                        )}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}

                {/* Botão Limpar Filtros */}
                {hasActiveFilters && (
                    <div className="flex flex-col justify-end shrink-0 pt-3">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-muted-foreground hover:text-foreground active:scale-95 transition-transform duration-100"
                            onClick={onClearFilters}
                            title="Limpar todos os filtros"
                        >
                            <ChevronRight className="h-4 w-4 rotate-180" />
                        </Button>
                    </div>
                )}
            </div>
            
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
