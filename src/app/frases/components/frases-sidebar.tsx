"use client";

import { Search, Loader2, RefreshCw, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ClientOnly } from '@/components/client-only';
import { cn } from '@/lib/utils';
import { CategoriesHierarchy } from '../types';
import { getCategoryIcon } from '../utils';

export interface FrasesSidebarProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    isRefreshing: boolean;
    onRefresh: () => void;
    selectedMainCategory: string;
    selectedSubCategory: string;
    initialMainCategories: string[];
    initialSubCategories: CategoriesHierarchy;
    onMainCategorySelect: (main: string) => void;
    onSubCategorySelect: (main: string, sub: string) => void;
}

export function FrasesSidebar({
    searchTerm,
    setSearchTerm,
    isRefreshing,
    onRefresh,
    selectedMainCategory,
    selectedSubCategory,
    initialMainCategories,
    initialSubCategories,
    onMainCategorySelect,
    onSubCategorySelect
}: FrasesSidebarProps) {
    const searchInput = (
        <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Buscar por frases ou autores..."
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
            <Button
                variant="ghost"
                onClick={() => onMainCategorySelect('Todos')}
                className={cn(
                    'w-full justify-start text-base font-semibold px-3 py-2 rounded-md',
                    selectedMainCategory === 'Todos' && 'bg-secondary text-primary'
                )}
            >
                <LayoutGrid className="mr-2 h-4 w-4" />
                Todos
            </Button>
            <ClientOnly>
                <Accordion type="multiple" className="w-full">
                    {initialMainCategories
                        .filter((cat) => cat !== 'Todos')
                        .map((mainCat, index) => {
                            const subCats = (initialSubCategories[mainCat] || []);
                            const Icon = getCategoryIcon(mainCat);

                            if (subCats.length === 0 || (subCats.length === 1 && subCats[0] === 'Todos')) {
                                return (
                                    <Button
                                        key={mainCat}
                                        variant='ghost'
                                        onClick={() => onMainCategorySelect(mainCat)}
                                        className={cn('w-full justify-start text-base font-semibold px-3 py-2 transition-colors rounded-md hover:bg-muted/50',
                                            selectedMainCategory === mainCat && selectedSubCategory === 'Todos' && 'bg-primary/10 text-primary'
                                        )}
                                    >
                                        <Icon className="mr-2 h-4 w-4" />
                                        {mainCat}
                                    </Button>
                                );
                            }
                            return (
                                <AccordionItem value={`item-${index}`} key={mainCat} className='border-none'>
                                    <AccordionTrigger
                                        onClick={() => onMainCategorySelect(mainCat)}
                                        className={cn(
                                            'font-semibold text-base hover:no-underline px-3 py-2 transition-colors rounded-md hover:bg-muted/50 w-full justify-start',
                                            selectedMainCategory === mainCat && 'bg-primary/10 text-primary'
                                        )}
                                    >
                                        <div className="flex items-center flex-1 text-left">
                                            <Icon className="mr-2 h-4 w-4" />
                                            {mainCat}
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className='pt-1'>
                                        <div className="flex flex-col items-start gap-1 pl-4 border-l-2 border-muted ml-3">
                                            {subCats.map((subCat) => (
                                                <Button
                                                    key={subCat}
                                                    variant="ghost"
                                                    onClick={() => onSubCategorySelect(mainCat, subCat)}
                                                    className={cn(
                                                        'w-full justify-start text-sm h-8 px-3 transition-colors rounded-md hover:bg-muted/50',
                                                        selectedMainCategory === mainCat &&
                                                        selectedSubCategory === subCat &&
                                                        'bg-primary/10 text-primary font-semibold'
                                                    )}
                                                >
                                                    {subCat}
                                                </Button>
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            );
                        })}
                </Accordion>
            </ClientOnly>
        </div>
    );
}
