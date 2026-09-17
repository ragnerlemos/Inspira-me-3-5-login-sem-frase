import { LucideIcon } from 'lucide-react';

export interface QuoteWithAuthor {
    id: string;
    quote: string;
    author?: string;
    category?: string;
    subCategory?: string;
    sheetName: string;
    date?: string;
    time?: string;
    rowNumber?: number;
    hasId?: boolean;
    intro?: string;
    conclusion?: string;
    description?: string;
    music?: string;
}

export interface CategoriesHierarchy {
    [mainCategory: string]: string[];
}

export interface SheetHierarchy {
    [sheetName: string]: {
        [category1: string]: string[];
    };
}

export interface GlobalSubCategoryContext {
    name: string;
    count: number;
}

export interface GlobalSubCategory {
    name: string;
    normalizedKey: string;
    totalCount: number;
    contexts: GlobalSubCategoryContext[];
}

export interface FrasesClientPageProps {
    initialQuotes: QuoteWithAuthor[];
    initialMainCategories: string[];
    initialHierarchy: SheetHierarchy;
    pageTitle?: string;
}
