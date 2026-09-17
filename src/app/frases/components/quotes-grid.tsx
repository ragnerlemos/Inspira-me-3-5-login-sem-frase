"use client";

import { QuoteCard } from './quote-card';
import { QuoteWithAuthor } from '../types';
import type { Template } from '@/hooks/use-templates';

interface QuotesGridProps {
    quotes: QuoteWithAuthor[];
    favorites: string[];
    isAdmin: boolean;
    highlightedQuoteId?: string | null;
    layouts: Template[];
    backgrounds: Template[];
    cardLayouts: Record<string, string>;
    cardBackgrounds: Record<string, string>;
    onSelectLayout: (quoteId: string, templateId: string) => void;
    onSelectBackground: (quoteId: string, templateId: string) => void;
    onToggleFavorite: (id: string) => void;
    onPreviewMeme: (quote: QuoteWithAuthor, layoutId?: string, backgroundId?: string) => void;
    onCopy: (text: string, author?: string) => void;
    onShareMeme: (quote: QuoteWithAuthor, layoutId?: string, backgroundId?: string) => void;
    onGoToEditor: (quote: QuoteWithAuthor, layoutId?: string, backgroundId?: string) => void;
    onEditCadastro?: (quote: QuoteWithAuthor) => void;
    onQuickEditQuote?: (quote: QuoteWithAuthor, newText: string) => Promise<boolean | void>;
    onShareText: (text: string, author?: string) => void;
    onGlobalDelete: (quote: QuoteWithAuthor) => void;
    onSubCategoryClick: (sub: string) => void;
    onMainCategoryClick: (main: string) => void;
}

export function QuotesGrid({
    quotes,
    favorites,
    isAdmin,
    highlightedQuoteId,
    layouts,
    backgrounds,
    cardLayouts,
    cardBackgrounds,
    onSelectLayout,
    onSelectBackground,
    onToggleFavorite,
    onPreviewMeme,
    onCopy,
    onShareMeme,
    onGoToEditor,
    onEditCadastro,
    onQuickEditQuote,
    onShareText,
    onGlobalDelete,
    onSubCategoryClick,
    onMainCategoryClick
}: QuotesGridProps) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quotes.map((quote, index) => (
                <QuoteCard
                    key={`${quote.id}-${index}`}
                    quote={quote}
                    isFavorited={favorites.includes(quote.id)}
                    isAdmin={isAdmin}
                    isHighlighted={highlightedQuoteId === quote.id}
                    layouts={layouts}
                    backgrounds={backgrounds}
                    selectedLayoutId={cardLayouts[quote.id] || 'template-twitter'}
                    selectedBackgroundId={cardBackgrounds[quote.id]}
                    onSelectLayout={(templateId) => onSelectLayout(quote.id, templateId)}
                    onSelectBackground={(templateId) => onSelectBackground(quote.id, templateId)}
                    onToggleFavorite={onToggleFavorite}
                    onPreviewMeme={onPreviewMeme}
                    onCopy={onCopy}
                    onShareMeme={onShareMeme}
                    onGoToEditor={onGoToEditor}
                    onEditCadastro={onEditCadastro}
                    onQuickEditQuote={onQuickEditQuote}
                    onShareText={onShareText}
                    onGlobalDelete={onGlobalDelete}
                    onSubCategoryClick={onSubCategoryClick}
                    onMainCategoryClick={onMainCategoryClick}
                />
            ))}
        </div>
    );
}
