"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { FrasesSidebar } from './frases-sidebar';
import { SheetHierarchy, GlobalSubCategory } from '../types';

interface MobileCategorySheetProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    isRefreshing: boolean;
    onRefresh: (silent?: boolean) => void;
    selectedMainCategory: string;
    selectedSubCategory: string;
    selectedSubSubCategory: string;
    initialMainCategories: string[];
    initialHierarchy: SheetHierarchy;
    onMainCategorySelect: (cat: string) => void;
    onSubCategorySelect: (main: string, sub: string) => void;
    onSubSubCategorySelect: (main: string, sub: string, subSub: string) => void;
    categoryCounts?: Record<string, number>;
    globalSubCategories?: GlobalSubCategory[];
}

export function MobileCategorySheet({
    isOpen,
    onOpenChange,
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
}: MobileCategorySheetProps) {
    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent 
                side="left" 
                className="flex flex-col w-[88vw] max-w-[380px] sm:w-[380px] p-0"
                onOpenAutoFocus={(e) => e.preventDefault()}
                onOverlayClick={() => onOpenChange(false)}
                onPointerDownOutside={() => onOpenChange(false)}
                onInteractOutside={() => onOpenChange(false)}
                onEscapeKeyDown={() => onOpenChange(false)}
            >
                <div className="p-4 pb-2 border-b">
                    <SheetHeader>
                        <SheetTitle>Categorias</SheetTitle>
                        <SheetDescription className="sr-only">Selecione uma categoria para filtrar as frases</SheetDescription>
                    </SheetHeader>
                </div>
                <ScrollArea className="flex-1 px-4">
                    <div className="py-4">
                        <FrasesSidebar
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            isRefreshing={isRefreshing}
                            onRefresh={onRefresh}
                            selectedMainCategory={selectedMainCategory}
                            selectedSubCategory={selectedSubCategory}
                            selectedSubSubCategory={selectedSubSubCategory}
                            initialMainCategories={initialMainCategories}
                            initialHierarchy={initialHierarchy}
                            onMainCategorySelect={onMainCategorySelect}
                            onSubCategorySelect={onSubCategorySelect}
                            onSubSubCategorySelect={onSubSubCategorySelect}
                            categoryCounts={categoryCounts}
                            globalSubCategories={globalSubCategories}
                        />
                    </div>
                </ScrollArea>
                <div className="p-3 border-t bg-muted/20">
                    <Button 
                        variant="default" 
                        className="w-full font-semibold"
                        onClick={() => onOpenChange(false)}
                    >
                        Ver Frases {selectedMainCategory && selectedMainCategory !== 'Todos' ? `(${selectedMainCategory})` : ''}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
