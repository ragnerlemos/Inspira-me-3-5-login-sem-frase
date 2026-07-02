import { LucideIcon } from 'lucide-react';

export interface QuoteWithAuthor {
    id: string;
    quote: string;
    author?: string;
    category: string;
    subCategory?: string;
    sheetName?: string;
    date?: string;
    time?: string;
    rowNumber?: number;
    hasId?: boolean;
}

export interface CategoriesHierarchy {
    [mainCategory: string]: string[];
}

export interface FrasesClientPageProps {
    initialQuotes: QuoteWithAuthor[];
    initialMainCategories: string[];
    initialSubCategories: CategoriesHierarchy;
    pageTitle?: string;
}
