"use client";

import { useState, useEffect } from 'react';
import { Search, Loader2, RefreshCw, LayoutGrid, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ClientOnly } from '@/components/client-only';
import { cn } from '@/lib/utils';
import { SheetHierarchy, GlobalSubCategory } from '../types';
import { getCategoryIcon } from '../utils';

export interface FrasesSidebarProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    isRefreshing: boolean;
    onRefresh: () => void;
    selectedMainCategory: string;
    selectedSubCategory: string;
    selectedSubSubCategory: string;
    initialMainCategories: string[];
    initialHierarchy: SheetHierarchy;
    onMainCategorySelect: (main: string) => void;
    onSubCategorySelect: (main: string, sub: string) => void;
    onSubSubCategorySelect: (main: string, sub: string, subSub: string) => void;
    categoryCounts?: Record<string, number>;
    globalSubCategories?: GlobalSubCategory[];
}

export function FrasesSidebar({
    searchTerm,
    setSearchTerm,
    isRefreshing,
    onRefresh,
    selectedMainCategory,
    selectedSubCategory,
    selectedSubSubCategory,
    initialMainCategories,
    initialHierarchy,
    onMainCategorySelect,
    onSubCategorySelect,
    onSubSubCategorySelect,
    categoryCounts,
    globalSubCategories
}: FrasesSidebarProps) {
    const [expandedSubCats, setExpandedSubCats] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (selectedMainCategory && selectedMainCategory.toLowerCase() !== 'todos') {
            const canonicalMain = initialMainCategories.find(c => c.toLowerCase().trim() === selectedMainCategory.toLowerCase().trim()) || selectedMainCategory;
            const expKey = `main-${canonicalMain}`;
            setExpandedSubCats(prev => {
                const next = { ...prev, [expKey]: true };
                if (selectedSubCategory && selectedSubCategory.toLowerCase() !== 'todos') {
                    next[`main-${canonicalMain}-${selectedSubCategory}`] = true;
                }
                return next;
            });
        }
    }, [selectedMainCategory, selectedSubCategory, initialMainCategories]);

    useEffect(() => {
        if (selectedSubCategory && selectedSubCategory.toLowerCase() !== 'todos') {
            const expKey = `global-${selectedSubCategory.toLowerCase()}`;
            setExpandedSubCats(prev => {
                if (prev[expKey]) return prev;
                return { ...prev, [expKey]: true };
            });
        }
    }, [selectedSubCategory]);

    const toggleExpanded = (key: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedSubCats(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const searchInput = (
        <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Buscar por frases, autores, categorias..."
                className="pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
    );

    return (
        <div className="space-y-1">
            {searchInput}
            <Button
                variant="outline"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="w-full justify-start text-base font-semibold px-3 py-2 rounded-md"
            >
                {isRefreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Atualizar
            </Button>
            <div className="py-1">
                <Button
                    variant="ghost"
                    onClick={() => onMainCategorySelect('Todos')}
                    className={cn(
                        'w-full justify-start text-base font-bold px-3 py-2.5 rounded-md transition-all duration-200',
                        selectedMainCategory.toLowerCase() === 'todos' && selectedSubCategory.toLowerCase() === 'todos'
                            ? 'bg-sky-600 hover:bg-sky-700 text-white border border-sky-500 dark:border-sky-400 shadow-sm'
                            : 'bg-sky-50/60 dark:bg-[#0a2e3f] hover:bg-sky-100/60 dark:hover:bg-[#0e3f56] text-sky-700 dark:text-sky-200 border border-sky-100/80 dark:border-none'
                    )}
                >
                    <div className="flex items-center gap-1.5">
                        <LayoutGrid className={cn("mr-2 h-4 w-4 transition-colors", selectedMainCategory.toLowerCase() === 'todos' && selectedSubCategory.toLowerCase() === 'todos' ? "text-white" : "text-sky-600 dark:text-sky-400")} />
                        <span>Todos</span>
                        {categoryCounts?.['Todos'] !== undefined && (
                            <div className="text-base font-bold opacity-80">({categoryCounts['Todos']})</div>
                        )}
                    </div>
                </Button>
            </div>
            <div className="border-b border-muted/80 my-2" />
            
            <ClientOnly>
                {/* Menu principal das 4 abas */}
                <div className="space-y-1">
                    {initialMainCategories
                        .filter((cat) => cat !== 'Todos')
                        .map((mainCat) => {
                            const Icon = getCategoryIcon(mainCat);
                            const mainCount = categoryCounts?.[mainCat];
                            const isSelected = selectedMainCategory.toLowerCase().trim() === mainCat.toLowerCase().trim() && selectedSubCategory.toLowerCase().trim() === 'todos';
                            const hierarchyKey = Object.keys(initialHierarchy || {}).find(
                                (k) => k.toLowerCase().trim() === mainCat.toLowerCase().trim()
                            );
                            const mainSubCats = hierarchyKey && initialHierarchy[hierarchyKey]
                                ? Object.keys(initialHierarchy[hierarchyKey]).sort()
                                : (initialHierarchy[mainCat] ? Object.keys(initialHierarchy[mainCat]).sort() : []);
                            const hasSubCats = mainSubCats.length > 0;
                            const expKey = `main-${mainCat}`;
                            const isExpanded = !!expandedSubCats[expKey];

                            return (
                                <div key={mainCat} className="w-full space-y-0.5">
                                    <div className="flex items-center w-full group/main">
                                        <Button
                                            variant='ghost'
                                            onClick={() => {
                                                onMainCategorySelect(mainCat);
                                                if (hasSubCats) {
                                                    setExpandedSubCats(prev => ({
                                                        ...prev,
                                                        [expKey]: !prev[expKey]
                                                    }));
                                                }
                                            }}
                                            className={cn(
                                                'w-full flex items-center justify-between text-base font-bold px-3 py-2.5 transition-colors rounded-md hover:bg-muted/50 text-left',
                                                isSelected && 'bg-primary/10 text-primary'
                                            )}
                                        >
                                            <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                                                <Icon className="mr-2 h-4 w-4 shrink-0" />
                                                <span className="capitalize truncate">{mainCat}</span>
                                                {mainCount !== undefined && (
                                                    <div className="text-base font-bold opacity-80 shrink-0">({mainCount})</div>
                                                )}
                                            </div>
                                            {isExpanded ? (
                                                <ChevronUp className="h-4 w-4 text-muted-foreground transition-transform duration-200 shrink-0 ml-2" />
                                            ) : (
                                                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 shrink-0 ml-2" />
                                            )}
                                        </Button>
                                    </div>

                                    {hasSubCats && isExpanded && (
                                        <div className="pl-4 border-l-2 border-muted/50 ml-3 py-1 space-y-0.5 animate-in slide-in-from-top-1 duration-150">
                                            {mainSubCats.map((subCat) => {
                                                const isSubSelected = selectedMainCategory.toLowerCase().trim() === mainCat.toLowerCase().trim() && selectedSubCategory.toLowerCase().trim() === subCat.toLowerCase().trim();
                                                const subSubCats = (hierarchyKey && initialHierarchy[hierarchyKey]?.[subCat]) || initialHierarchy[mainCat]?.[subCat] || [];
                                                const hasSubSubCats = subSubCats.length > 0;
                                                const subExpKey = `main-${mainCat}-${subCat}`;
                                                const isSubExpanded = !!expandedSubCats[subExpKey];
                                                const subCount = categoryCounts?.[`${mainCat}-${subCat}`];

                                                return (
                                                    <div key={subCat} className="w-full space-y-0.5">
                                                        <div className="flex items-center w-full">
                                                            <Button
                                                                variant="ghost"
                                                                onClick={() => {
                                                                    onSubCategorySelect(mainCat, subCat);
                                                                    if (hasSubSubCats) {
                                                                        setExpandedSubCats(prev => ({
                                                                            ...prev,
                                                                            [subExpKey]: !prev[subExpKey]
                                                                        }));
                                                                    }
                                                                }}
                                                                className={cn(
                                                                    'w-full flex items-center justify-between text-sm font-bold h-9 px-2.5 transition-colors rounded-md hover:bg-muted/50 text-left',
                                                                    isSubSelected && selectedSubSubCategory === 'Todos'
                                                                        ? 'bg-primary/15 text-primary'
                                                                        : 'text-muted-foreground hover:text-foreground'
                                                                )}
                                                            >
                                                                <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                                                                    <span className="text-xs text-muted-foreground/70 mr-0.5">├─</span>
                                                                    <span className="capitalize truncate">{subCat}</span>
                                                                    {subCount !== undefined && (
                                                                        <div className="text-xs font-bold opacity-75 shrink-0">({subCount})</div>
                                                                    )}
                                                                </div>
                                                                {isSubExpanded ? (
                                                                    <ChevronUp className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 shrink-0 ml-2" />
                                                                ) : (
                                                                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 shrink-0 ml-2" />
                                                                )}
                                                            </Button>
                                                        </div>

                                                        {hasSubSubCats && isSubExpanded && (
                                                            <div className="pl-4 border-l border-muted/40 ml-4 py-0.5 space-y-0.5">
                                                                {subSubCats.map((subSubCat) => {
                                                                    const isSubSubSelected = isSubSelected && selectedSubSubCategory.toLowerCase() === subSubCat.toLowerCase();
                                                                    const subSubCount = categoryCounts?.[`${mainCat}-${subCat}-${subSubCat}`];
                                                                    return (
                                                                        <Button
                                                                            key={subSubCat}
                                                                            variant="ghost"
                                                                            onClick={() => onSubSubCategorySelect(mainCat, subCat, subSubCat)}
                                                                            className={cn(
                                                                                'w-full justify-start text-sm font-semibold h-8 px-2 transition-colors rounded-md hover:bg-muted/50 text-left',
                                                                                isSubSubSelected
                                                                                    ? 'bg-primary/20 text-primary font-bold'
                                                                                    : 'text-muted-foreground/80 hover:text-foreground'
                                                                            )}
                                                                        >
                                                                            <div className="flex items-center gap-1 min-w-0 overflow-hidden">
                                                                                <span className="opacity-50 mr-0.5">└─</span>
                                                                                <span className="capitalize truncate">{subSubCat}</span>
                                                                                {subSubCount !== undefined && (
                                                                                    <div className="text-xs font-semibold opacity-75 shrink-0">({subSubCount})</div>
                                                                                )}
                                                                            </div>
                                                                        </Button>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                </div>

                {/* Subcategorias Globais */}
                {globalSubCategories && globalSubCategories.length > 0 && (
                    <>
                        <div className="border-b border-muted/80 my-3" />
                        <div className="pt-1 space-y-1">
                            <div className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                                Subcategorias
                            </div>
                            <div className="flex flex-col gap-0.5">
                                {globalSubCategories.map((sub) => {
                                    const isSubSelected = selectedSubCategory.toLowerCase() === sub.normalizedKey;
                                    const expKey = `global-${sub.normalizedKey}`;
                                    const isExpanded = !!expandedSubCats[expKey];

                                    return (
                                        <div key={sub.normalizedKey} className="w-full space-y-0.5">
                                            <div className="flex items-center w-full group/item">
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => {
                                                        onSubCategorySelect('Todos', sub.name);
                                                        if (sub.contexts.length > 0) {
                                                            setExpandedSubCats(prev => ({
                                                                ...prev,
                                                                [expKey]: !prev[expKey]
                                                            }));
                                                        }
                                                    }}
                                                    className={cn(
                                                        'w-full flex items-center justify-between text-base font-bold h-10 px-3 transition-colors rounded-md hover:bg-muted/50 text-left',
                                                        isSubSelected && selectedSubSubCategory === 'Todos'
                                                            ? 'bg-primary/10 text-primary'
                                                            : 'text-foreground/90'
                                                    )}
                                                >
                                                    <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                                                        <span className="capitalize truncate">{sub.name}</span>
                                                        <div className="text-sm font-bold opacity-80 shrink-0">({sub.totalCount})</div>
                                                    </div>
                                                    {isExpanded ? (
                                                        <ChevronUp className="h-4 w-4 text-muted-foreground transition-transform duration-200 shrink-0 ml-2" />
                                                    ) : (
                                                        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 shrink-0 ml-2" />
                                                    )}
                                                </Button>
                                            </div>

                                            {sub.contexts.length > 0 && isExpanded && (
                                                <div className="pl-4 border-l-2 border-muted/50 ml-3 py-1 space-y-0.5 animate-in slide-in-from-top-1 duration-150">
                                                    {sub.contexts.map((ctx) => {
                                                        const isCtxSelected = isSubSelected && selectedSubSubCategory.toLowerCase() === ctx.name.toLowerCase();
                                                        return (
                                                            <Button
                                                                key={ctx.name}
                                                                variant="ghost"
                                                                onClick={() => onSubSubCategorySelect('Todos', sub.name, ctx.name)}
                                                                className={cn(
                                                                    'w-full justify-start text-sm font-semibold h-9 px-2.5 transition-colors rounded-md hover:bg-muted/50 text-left',
                                                                    isCtxSelected
                                                                        ? 'bg-primary/15 text-primary font-bold'
                                                                        : 'text-muted-foreground hover:text-foreground'
                                                                )}
                                                            >
                                                                <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                                                                    <span className="text-xs text-muted-foreground/70 mr-0.5">├─</span>
                                                                    <span className="capitalize truncate">{ctx.name}</span>
                                                                    <div className="text-xs font-semibold opacity-75 shrink-0">({ctx.count})</div>
                                                                </div>
                                                            </Button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}
            </ClientOnly>
        </div>
    );
}

