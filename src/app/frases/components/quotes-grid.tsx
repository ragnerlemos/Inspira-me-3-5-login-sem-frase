"use client";

import { QuoteCard } from './quote-card';
import { QuoteWithAuthor } from '../types';

interface QuotesGridProps {
    quotes: QuoteWithAuthor[];
    favorites: string[];
    isAdmin: boolean;
    onToggleFavorite: (id: string) => void;
    onPreviewMeme: (quote: QuoteWithAuthor) => void;
    onCopy: (text: string, author?: string) => void;
    onShareMeme: (quote: QuoteWithAuthor) => void;
    onGoToEditor: (quote: QuoteWithAuthor) => void;
    onShareText: (text: string, author?: string) => void;
    onGlobalDelete: (quote: QuoteWithAuthor) => void;
    onSubCategoryClick: (sub: string) => void;
}

export function QuotesGrid({
    quotes,
    favorites,
    isAdmin,
    onToggleFavorite,
    onPreviewMeme,
    onCopy,
    onShareMeme,
    onGoToEditor,
    onShareText,
    onGlobalDelete,
    onSubCategoryClick
}: QuotesGridProps) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quotes.map((quote, index) => (
                <QuoteCard
                    key={`${quote.id}-${index}`}
                    quote={quote}
                    isFavorited={favorites.includes(quote.id)}
                    isAdmin={isAdmin}
                    onToggleFavorite={onToggleFavorite}
                    onPreviewMeme={onPreviewMeme}
                    onCopy={onCopy}
                    onShareMeme={onShareMeme}
                    onGoToEditor={onGoToEditor}
                    onShareText={onShareText}
                    onGlobalDelete={onGlobalDelete}
                    onSubCategoryClick={onSubCategoryClick}
                />
            ))}
        </div>
    );
}
