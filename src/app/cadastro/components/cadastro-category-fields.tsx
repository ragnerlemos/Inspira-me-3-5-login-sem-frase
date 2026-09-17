"use client";

import { useMemo, useEffect, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { SearchableCombobox, type SearchableGroup } from './searchable-combobox';

interface CadastroCategoryFieldsProps {
    selectedSheet: string;
    selectedMainCategory: string;
    onMainCategoryChange: (value: string) => void;
    categoriesForSelectedSheet: Record<string, string[]>;
    allExistingCategories?: string[];
    newMainCategoryInput: string;
    onNewMainCategoryChange: (value: string) => void;
    selectedSubCategory: string;
    onSubCategoryChange: (value: string) => void;
    newSubCategoryInput: string;
    onNewSubCategoryChange: (value: string) => void;
}

function deduplicateCaseInsensitive(items: string[]): string[] {
    const map = new Map<string, string>();
    items.forEach(item => {
        if (!item) return;
        const trimmed = item.trim();
        if (!trimmed || trimmed.toLowerCase() === 'geral') return;
        const key = trimmed.toLowerCase();
        const existing = map.get(key);
        if (!existing) {
            map.set(key, trimmed);
        } else {
            // Se o item atual tiver letra inicial maiúscula e o existente for minúsculo, prefere o com inicial maiúscula
            if (trimmed[0] === trimmed[0].toUpperCase() && existing[0] !== existing[0].toUpperCase()) {
                map.set(key, trimmed);
            }
        }
    });
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
}

export function CadastroCategoryFields({
    selectedSheet,
    selectedMainCategory,
    onMainCategoryChange,
    categoriesForSelectedSheet,
    allExistingCategories = [],
    newMainCategoryInput,
    onNewMainCategoryChange,
    selectedSubCategory,
    onSubCategoryChange,
    newSubCategoryInput,
    onNewSubCategoryChange
}: CadastroCategoryFieldsProps) {
    const isSheetValid = Boolean(selectedSheet);
    const mainCategoryInputRef = useRef<HTMLInputElement>(null);
    const subCategoryInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (selectedMainCategory === '__new__') {
            const timer = setTimeout(() => {
                mainCategoryInputRef.current?.focus();
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [selectedMainCategory]);

    useEffect(() => {
        if (selectedSubCategory === '__new__') {
            const timer = setTimeout(() => {
                subCategoryInputRef.current?.focus();
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [selectedSubCategory]);

    // Lista de opções para Categoria 1 (com desduplicação case-insensitive)
    const mainCategoryOptions = useMemo(() => {
        const rawItems: string[] = [];
        Object.keys(categoriesForSelectedSheet).forEach(cat => {
            if (cat && cat.trim()) rawItems.push(cat.trim());
        });
        if (rawItems.length === 0 && allExistingCategories.length > 0) {
            allExistingCategories.forEach(cat => {
                if (cat && cat.trim()) rawItems.push(cat.trim());
            });
        }
        return deduplicateCaseInsensitive(rawItems);
    }, [categoriesForSelectedSheet, allExistingCategories]);

    // Lista estrita de Categorias 2 (subcategorias) organizadas em grupos
    const category2Groups = useMemo<SearchableGroup[]>(() => {
        const allSubs: string[] = [];
        allExistingCategories.forEach(sub => {
            if (sub && sub.trim()) {
                allSubs.push(sub.trim());
            }
        });
        Object.values(categoriesForSelectedSheet).forEach(subs => {
            if (Array.isArray(subs)) {
                subs.forEach(s => {
                    if (s && s.trim()) {
                        allSubs.push(s.trim());
                    }
                });
            }
        });

        const relatedSubs: string[] = [];
        if (selectedMainCategory && selectedMainCategory !== '__new__' && selectedMainCategory !== '__none__') {
            const list = categoriesForSelectedSheet[selectedMainCategory] || [];
            list.forEach(s => {
                if (s && s.trim()) relatedSubs.push(s.trim());
            });
        }

        const relatedList = deduplicateCaseInsensitive(relatedSubs);
        const allList = deduplicateCaseInsensitive(allSubs);
        const otherSubs = allList.filter(cat => !relatedList.some(r => r.toLowerCase() === cat.toLowerCase()));

        const groups: SearchableGroup[] = [];
        if (relatedList.length > 0) {
            groups.push({
                label: `Subcategorias de ${selectedMainCategory}`,
                options: relatedList
            });
        }
        if (otherSubs.length > 0) {
            groups.push({
                label: relatedList.length > 0 ? "Outras Subcategorias Existentes" : "Todas as Subcategorias",
                options: otherSubs
            });
        }
        return groups;
    }, [categoriesForSelectedSheet, selectedMainCategory, allExistingCategories]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Categoria 1 */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="category-name" className="text-primary text-sm font-medium">Categoria 1</Label>
                    <span className="text-[11px] text-muted-foreground">Busca inteligente</span>
                </div>
                {isSheetValid ? (
                <>
                    <SearchableCombobox
                        value={selectedMainCategory}
                        onValueChange={onMainCategoryChange}
                        options={mainCategoryOptions}
                        placeholder="Pesquisar ou selecionar categoria..."
                        searchPlaceholder="Digite nome ou iniciais (ex: vorcar)..."
                        allowNone={true}
                        noneLabel="Nenhuma"
                        allowCreate={true}
                        createLabel="Criar nova categoria..."
                    />

                    {selectedMainCategory === '__new__' && (
                    <div className="pt-2 animate-in fade-in slide-in-from-top-2">
                        <Input 
                            ref={mainCategoryInputRef}
                            value={newMainCategoryInput} 
                            onChange={e => onNewMainCategoryChange(e.target.value)} 
                            placeholder="Nome da nova categoria..." 
                            className="border-primary/50 focus-visible:ring-primary" 
                        />
                    </div>
                    )}
                </>
                ) : (
                <div className="h-10 flex items-center px-3 border rounded-md bg-muted/50 text-sm text-muted-foreground">
                    Aba pendente
                </div>
                )}
            </div>

            {/* Categoria 2 */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="sub-category-name" className="text-primary text-sm font-medium">Categoria 2 (Opcional)</Label>
                    <span className="text-[11px] text-muted-foreground">Busca inteligente</span>
                </div>
                {isSheetValid ? (
                <>
                    <SearchableCombobox
                        value={selectedSubCategory}
                        onValueChange={onSubCategoryChange}
                        groups={category2Groups}
                        placeholder="Pesquisar ou selecionar subcategoria..."
                        searchPlaceholder="Digite nome ou iniciais (ex: vorcar)..."
                        allowNone={true}
                        noneLabel="Nenhuma"
                        allowCreate={true}
                        createLabel="Criar nova subcategoria..."
                    />

                    {selectedSubCategory === '__new__' && (
                        <div className="pt-2 animate-in fade-in slide-in-from-top-2">
                            <Input 
                                ref={subCategoryInputRef}
                                value={newSubCategoryInput} 
                                onChange={e => onNewSubCategoryChange(e.target.value)} 
                                placeholder="Nome da nova subcategoria..." 
                                className="border-primary/50 focus-visible:ring-primary" 
                            />
                        </div>
                    )}
                </>
                ) : (
                <div className="h-10 flex items-center px-3 border rounded-md bg-muted/50 text-sm text-muted-foreground">
                    Aba pendente
                </div>
                )}
            </div>
        </div>
    );
}
