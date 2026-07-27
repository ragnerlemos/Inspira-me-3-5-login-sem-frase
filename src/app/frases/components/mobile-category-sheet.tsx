"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FrasesSidebar } from './frases-sidebar';

interface MobileCategorySheetProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    isRefreshing: boolean;
    onRefresh: (silent?: boolean) => void;
    selectedMainCategory: string;
    selectedSubCategory: string;
    initialMainCategories: string[];
    initialSubCategories: Record<string, string[]>;
    onMainCategorySelect: (cat: string) => void;
    onSubCategorySelect: (main: string, sub: string) => void;
    categoryCounts?: Record<string, number>;
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
    initialMainCategories,
    initialSubCategories,
    onMainCategorySelect,
    onSubCategorySelect,
    categoryCounts
}: MobileCategorySheetProps) {
    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent 
                side="left" 
                className="flex flex-col"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <SheetHeader>
                    <SheetTitle>Categorias</SheetTitle>
                    <SheetDescription className="sr-only">Selecione uma categoria para filtrar as frases</SheetDescription>
                </SheetHeader>
                <ScrollArea className="flex-1 pr-4 -mr-4">
                    <div className="py-4">
                        <FrasesSidebar
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            isRefreshing={isRefreshing}
                            onRefresh={onRefresh}
                            selectedMainCategory={selectedMainCategory}
                            selectedSubCategory={selectedSubCategory}
                            initialMainCategories={initialMainCategories}
                            initialSubCategories={initialSubCategories}
                            onMainCategorySelect={onMainCategorySelect}
                            onSubCategorySelect={onSubCategorySelect}
                            categoryCounts={categoryCounts}
                        />
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}
