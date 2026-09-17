"use client";

import { memo, useState } from 'react';
import { Star, Copy, Share2, Download, MoreVertical, Edit, Edit3, MessageSquare, Trash2, Check, FileSpreadsheet, Loader2, X, Calendar, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { QuoteWithAuthor } from '../types';
import { getCardClasses } from '../utils';
import type { Template } from '@/hooks/use-templates';
import Image from 'next/image';

export interface QuoteCardProps {
    quote: QuoteWithAuthor;
    isFavorited: boolean;
    isAdmin: boolean;
    isHighlighted?: boolean;
    layouts?: Template[];
    backgrounds?: Template[];
    selectedLayoutId?: string;
    selectedBackgroundId?: string;
    onSelectLayout?: (templateId: string) => void;
    onSelectBackground?: (templateId: string) => void;
    onToggleFavorite: (id: string) => void;
    onPreviewMeme: (quote: QuoteWithAuthor, layoutId?: string, backgroundId?: string) => void;
    onCopy: (text: string, author?: string) => void;
    onShareMeme: (quote: QuoteWithAuthor, layoutId?: string, backgroundId?: string) => void;
    onGoToEditor: (quote: QuoteWithAuthor, layoutId?: string, backgroundId?: string) => void;
    onEditCadastro?: (quote: QuoteWithAuthor) => void;
    onQuickEditQuote?: (quote: QuoteWithAuthor, newText: string) => Promise<boolean | void>;
    onShareText: (text: string, author?: string) => void;
    onGlobalDelete?: (quote: QuoteWithAuthor) => void;
    onSubCategoryClick: (subCategory: string) => void;
    onMainCategoryClick?: (mainCategory: string) => void;
}

export const QuoteCard = memo(function QuoteCard({
    quote,
    isFavorited,
    isAdmin,
    isHighlighted = false,
    layouts = [],
    backgrounds = [],
    selectedLayoutId,
    selectedBackgroundId,
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
}: QuoteCardProps) {
    const [isQuickEditing, setIsQuickEditing] = useState(false);
    const [editedText, setEditedText] = useState(quote.quote);
    const [isSaving, setIsSaving] = useState(false);

    const handleStartEditing = () => {
        setEditedText(quote.quote);
        setIsQuickEditing(true);
    };

    const handleCancelEditing = () => {
        setEditedText(quote.quote);
        setIsQuickEditing(false);
    };

    const handleSaveEditing = async () => {
        const trimmed = editedText.trim();
        if (!trimmed) return;
        if (trimmed === quote.quote) {
            setIsQuickEditing(false);
            return;
        }

        if (onQuickEditQuote) {
            setIsSaving(true);
            try {
                const res = await onQuickEditQuote(quote, trimmed);
                if (res !== false) {
                    setIsQuickEditing(false);
                }
            } finally {
                setIsSaving(false);
            }
        } else {
            setIsQuickEditing(false);
        }
    };

    return (
        <>
        <Card 
            id={`quote-card-${quote.id}`}
            className={cn(
                getCardClasses(),
                isHighlighted && "ring-4 ring-primary ring-offset-2 ring-offset-background shadow-2xl scale-[1.03] transition-all duration-500 border-primary"
            )}
        >
            <CardContent className="p-4 pb-2 flex-1 flex flex-col justify-between">
                <div>
                    {quote.date && (
                        <div className="flex items-center gap-1.5 mb-2 text-muted-foreground/75">
                            <Calendar className="h-3 w-3 shrink-0 opacity-70" />
                            <span suppressHydrationWarning className="text-[11px] font-medium tracking-tight">
                                {quote.date}
                            </span>
                        </div>
                    )}
                    <p suppressHydrationWarning className="text-sm font-body font-bold text-[var(--theme-card-text-color)]">{quote.quote}</p>
                </div>
                {quote.author && (
                    <p className="text-right text-[11px] font-medium text-[var(--theme-secondary-text-color)] italic mt-2">
                        - {quote.author}
                    </p>
                )}
            </CardContent>
            <CardFooter className="px-3 pt-1 pb-2 flex flex-col items-center gap-1.5">
                <div suppressHydrationWarning className="flex flex-row flex-nowrap items-center justify-center text-center w-full gap-1 py-0.5 overflow-hidden">
                    {(quote.category || quote.sheetName) && (
                        <Button 
                            variant="link" 
                            className="p-0 h-auto text-pink-500 dark:text-pink-400 text-[9px] font-semibold bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 px-2 py-0.5 rounded-full truncate max-w-[40%] hover:no-underline hover:bg-slate-200 dark:hover:bg-slate-800 transition-all shrink-0"
                            onClick={() => onMainCategoryClick?.(quote.category || quote.sheetName!)}
                            title={quote.category || quote.sheetName}
                        >
                            <span suppressHydrationWarning className="capitalize truncate">{quote.category || quote.sheetName}</span>
                        </Button>
                    )}

                    {quote.subCategory && quote.subCategory !== 'Todos' && (
                        <Button 
                            variant="link" 
                            className="p-0 h-auto text-primary/90 dark:text-emerald-400 text-[9px] font-semibold bg-primary/10 dark:bg-emerald-500/15 border border-primary/20 dark:border-emerald-500/25 px-2 py-0.5 rounded-full truncate max-w-[40%] hover:no-underline hover:bg-primary/20 transition-all shrink-0"
                            onClick={() => onSubCategoryClick(quote.subCategory!)}
                            title={quote.subCategory}
                        >
                            <span suppressHydrationWarning className="capitalize truncate">{quote.subCategory}</span>
                        </Button>
                    )}
                </div>
                <div className="flex justify-end items-center w-full border-t border-muted/20 pt-1.5 mt-0.5 -space-x-1">
                    <Button variant="ghost" size="icon-sm" onClick={() => onPreviewMeme(quote, selectedLayoutId, selectedBackgroundId)} title="Baixar com modelo selecionado">
                        <Download className="h-4 w-4 text-[var(--theme-interface-icon-color)]" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => onCopy(quote.quote, quote.author)} title="Copiar Frase">
                        <Copy className="h-4 w-4 text-[var(--theme-interface-icon-color)]" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => onShareText(quote.quote, quote.author)} title="Compartilhar Texto">
                        <Type className="h-4 w-4 text-[var(--theme-interface-icon-color)]" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => onToggleFavorite(quote.id)}>
                        <Star className={cn("h-4 w-4", isFavorited ? "text-[var(--theme-favorite-color)] fill-current" : "text-[var(--theme-interface-icon-color)]")} />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => onShareMeme(quote, selectedLayoutId, selectedBackgroundId)} title="Compartilhar com modelo selecionado">
                        <Share2 className="h-4 w-4 text-[var(--theme-interface-icon-color)]" />
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm" title="Configurações e Opções">
                                <MoreVertical className="h-4 w-4 text-[var(--theme-interface-icon-color)]" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 max-h-80 overflow-y-auto">
                            <DropdownMenuItem onClick={handleStartEditing}>
                                <Edit3 className="mr-2 h-4 w-4 text-primary" />
                                <span className="font-medium">Editar Card</span>
                            </DropdownMenuItem>
                            {onEditCadastro && (
                                <DropdownMenuItem onClick={() => onEditCadastro(quote)}>
                                    <FileSpreadsheet className="mr-2 h-4 w-4 text-primary" />
                                    <span>Editar Cadastro</span>
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => onGoToEditor(quote, selectedLayoutId, selectedBackgroundId)}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Ir para o Editor</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onShareText(quote.quote, quote.author)}>
                                <Type className="mr-2 h-4 w-4" />
                                <span>Compartilhar Texto</span>
                            </DropdownMenuItem>
                            {layouts.length > 0 && (
                                <>
                                    <DropdownMenuSeparator />
                                    <div className="px-2 py-1.5 text-xs font-semibold text-primary/80 uppercase tracking-wider">Escolher Layout</div>
                                    {layouts.map(t => (
                                        <DropdownMenuItem 
                                            key={t.id} 
                                            onSelect={(e) => {
                                                e.preventDefault();
                                                if (onSelectLayout) onSelectLayout(t.id);
                                            }}
                                            className="flex items-center justify-between cursor-pointer"
                                        >
                                            <span className="truncate">{t.name}</span>
                                            {selectedLayoutId === t.id && <Check className="h-4 w-4 text-primary" />}
                                        </DropdownMenuItem>
                                    ))}
                                </>
                            )}
                            {backgrounds.length > 0 && (
                                <>
                                    <DropdownMenuSeparator />
                                    <div className="px-2 py-1.5 text-xs font-semibold text-primary/80 uppercase tracking-wider">Escolher Fundo (Modelo Upo)</div>
                                    {backgrounds.map(t => (
                                        <DropdownMenuItem 
                                            key={t.id} 
                                            onSelect={(e) => {
                                                e.preventDefault();
                                                if (onSelectBackground) onSelectBackground(t.id);
                                            }}
                                            className="flex items-center justify-between cursor-pointer gap-2"
                                        >
                                            <span className="truncate flex-1">{t.name}</span>
                                            <div className="flex items-center gap-2 shrink-0">
                                                {t.thumbnail ? (
                                                    <div className="relative w-6 h-6 rounded overflow-hidden border border-border">
                                                        <Image src={t.thumbnail} alt={t.name} fill className="object-cover" unoptimized referrerPolicy="no-referrer" />
                                                    </div>
                                                ) : (
                                                    <div className="w-6 h-6 rounded bg-muted border border-border" />
                                                )}
                                                {selectedBackgroundId === t.id && <Check className="h-4 w-4 text-primary" />}
                                            </div>
                                        </DropdownMenuItem>
                                    ))}
                                </>
                            )}
                            {isAdmin && quote.hasId && onGlobalDelete && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                        className="text-destructive focus:text-destructive font-bold"
                                        onClick={() => onGlobalDelete(quote)}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Excluir do banco de dados
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardFooter>
        </Card>

        <Dialog open={isQuickEditing} onOpenChange={(open) => !open && handleCancelEditing()}>
            <DialogContent className="sm:max-w-[425px] w-[95vw] rounded-xl p-4 gap-4" aria-describedby={undefined}>
                <DialogHeader className="pb-2 border-b border-border/40 text-left">
                    <DialogTitle className="flex items-center gap-2 text-primary font-semibold text-base">
                        <Edit3 className="h-4 w-4" />
                        Editar Frase
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        Modifique o texto da frase abaixo. As alterações serão salvas imediatamente.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-2 pt-2">
                    <div className="flex justify-between items-center text-xs text-muted-foreground px-1">
                        <span>Texto da frase</span>
                        <span>{editedText.length} caracteres</span>
                    </div>
                    <Textarea
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        disabled={isSaving}
                        rows={6}
                        className="text-sm resize-none font-medium leading-relaxed focus-visible:ring-primary/50 rounded-lg p-3"
                        autoFocus
                        placeholder="Digite a nova frase..."
                    />
                </div>
                <DialogFooter className="pt-2 flex flex-row justify-end gap-2 sm:gap-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancelEditing}
                        disabled={isSaving}
                        className="rounded-lg h-9"
                    >
                        <X className="h-4 w-4 mr-1.5" />
                        Cancelar
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleSaveEditing}
                        disabled={isSaving || !editedText.trim()}
                        className="rounded-lg h-9 font-semibold"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                                Salvando...
                            </>
                        ) : (
                            <>
                                <Check className="h-4 w-4 mr-1.5" />
                                Salvar
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        </>
    );
});
