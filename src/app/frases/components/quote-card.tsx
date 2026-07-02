"use client";

import { Star, Copy, Share2, Download, MoreVertical, Edit, MessageSquare, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { QuoteWithAuthor } from '../types';
import { getCardClasses } from '../utils';

export interface QuoteCardProps {
    quote: QuoteWithAuthor;
    isFavorited: boolean;
    isAdmin: boolean;
    onToggleFavorite: (id: string) => void;
    onPreviewMeme: (quote: QuoteWithAuthor) => void;
    onCopy: (text: string, author?: string) => void;
    onShareMeme: (quote: QuoteWithAuthor) => void;
    onGoToEditor: (quote: QuoteWithAuthor) => void;
    onShareText: (text: string, author?: string) => void;
    onGlobalDelete?: (quote: QuoteWithAuthor) => void;
    onSubCategoryClick: (subCategory: string) => void;
}

export function QuoteCard({
    quote,
    isFavorited,
    isAdmin,
    onToggleFavorite,
    onPreviewMeme,
    onCopy,
    onShareMeme,
    onGoToEditor,
    onShareText,
    onGlobalDelete,
    onSubCategoryClick
}: QuoteCardProps) {
    return (
        <Card className={getCardClasses()}>
            <CardContent className="p-4 pb-0 flex-1">
                <p className="text-sm font-body text-[var(--theme-card-text-color)]">{quote.quote}</p>
            </CardContent>
            <CardFooter className="px-4 pt-2 pb-2 flex flex-col items-stretch gap-2">
                <div className="flex justify-between items-center w-full text-[10px]">
                    {quote.subCategory && quote.subCategory !== 'Todos' ? (
                        <Button 
                            variant="link" 
                            className="p-0 h-auto text-primary text-[10px] bg-primary/10 px-2 py-0.5 rounded-full truncate max-w-[120px] hover:no-underline hover:bg-primary/20"
                            onClick={() => onSubCategoryClick(quote.subCategory!)}
                        >
                            {quote.subCategory}
                        </Button>
                    ) : <div />}
                    {quote.author && (
                        <p className="font-medium text-[var(--theme-secondary-text-color)] truncate">
                            - {quote.author}
                        </p>
                    )}
                </div>
                <div className="flex justify-end items-center w-full border-t border-muted/20 pt-1.5 mt-1.5 -space-x-2 -mr-2">
                    <Button variant="ghost" size="icon-sm" onClick={() => onPreviewMeme(quote)}>
                        <Download className="h-4 w-4 text-[var(--theme-interface-icon-color)]" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => onCopy(quote.quote, quote.author)}>
                        <Copy className="h-4 w-4 text-[var(--theme-interface-icon-color)]" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => onToggleFavorite(quote.id)}>
                        <Star className={cn("h-4 w-4", isFavorited ? "text-[var(--theme-favorite-color)] fill-current" : "text-[var(--theme-interface-icon-color)]")} />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => onShareMeme(quote)}>
                        <Share2 className="h-4 w-4 text-[var(--theme-interface-icon-color)]" />
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm">
                                <MoreVertical className="h-4 w-4 text-[var(--theme-interface-icon-color)]" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => onGoToEditor(quote)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edição Avançada
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onShareText(quote.quote, quote.author)}>
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Compartilhar Texto
                            </DropdownMenuItem>
                            {isAdmin && quote.hasId && onGlobalDelete && (
                                <DropdownMenuItem 
                                    className="text-destructive focus:text-destructive font-bold"
                                    onClick={() => onGlobalDelete(quote)}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Excluir do banco de dados
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardFooter>
        </Card>
    );
}
