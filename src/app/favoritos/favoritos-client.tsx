
'use client';

import { useState, useEffect } from 'react';
import { useFavorites } from "@/hooks/use-favorites";
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { Clipboard } from '@capacitor/clipboard';
import { ClientOnly } from '@/components/client-only';
import { useProfile } from '@/hooks/use-profile';
import { MemeGenerator } from '@/components/meme-generator';

import { QuoteCard } from '../frases/components/quote-card';
import { QuoteSkeleton } from '../frases/components/quote-skeleton';
import { FavoritosHeader } from './components/favoritos-header';
import { FavoritosEmpty } from './components/favoritos-empty';
import { getMemeEditorState } from '../frases/utils';
import { QuoteWithAuthor } from '../frases/types';

interface FavoritesClientPageProps {
  allQuotes: QuoteWithAuthor[];
}

export function FavoritesClientPage({ allQuotes }: FavoritesClientPageProps) {
  const { favorites, toggleFavorite } = useFavorites();
  const { toast } = useToast();
  const router = useRouter();
  const { profile } = useProfile();
  
  const [favoriteQuotes, setFavoriteQuotes] = useState<QuoteWithAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quoteForMeme, setQuoteForMeme] = useState<{ quote: QuoteWithAuthor; action: 'preview' | 'share'; } | null>(null);

  useEffect(() => {
    setIsLoading(true);
    if (allQuotes) {
      const userFavorites = allQuotes.filter(quote => favorites.includes(quote.id));
      setFavoriteQuotes(userFavorites);
    }
    setIsLoading(false);
  }, [favorites, allQuotes]);

  const handleCopy = async (text: string, author?: string) => {
    const textToCopy = author ? `${text} - ${author}` : text;
    try {
        if (Capacitor.isNativePlatform()) {
            await Clipboard.write({ string: textToCopy });
            toast({ title: 'Copiado!', description: 'A frase foi copiada para a sua área de transferência.' });
            return;
        }

        let copied = false;
        if (navigator.clipboard && window.isSecureContext) {
            try {
                await navigator.clipboard.writeText(textToCopy);
                toast({ title: 'Copiado!', description: 'A frase foi copiada para a sua área de transferência.' });
                copied = true;
            } catch (clipErr) {
                console.warn('navigator.clipboard.writeText failed, playing back fallback:', clipErr);
            }
        }

        if (!copied) {
            const textArea = document.createElement('textarea');
            textArea.value = textToCopy;
            textArea.style.position = 'fixed';
            textArea.style.left = '-9999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                toast({ title: 'Copiado!', description: 'A frase foi copiada para a sua área de transferência.' });
            } catch (err) {
                console.error('Falha ao usar execCommand:', err);
                toast({ title: 'Erro ao Copiar', description: 'Não foi possível copiar.', variant: 'destructive' });
            }
            document.body.removeChild(textArea);
        }
    } catch (err) {
        console.error('Falha ao copiar:', err);
        toast({ title: 'Erro ao Copiar', description: 'Não foi possível copiar a frase.', variant: 'destructive' });
    }
  };

  const handleShare = async (text: string, author?: string) => {
    const shareText = author ? `"${text}" - ${author}` : text;
    
    if (Capacitor.isNativePlatform()) {
        try {
            await Share.share({
                title: 'InspireMe',
                text: shareText,
                dialogTitle: 'Compartilhar Frase'
            });
        } catch (error) {
            console.error("Erro ao usar Capacitor Share API, usando fallback de cópia:", error);
            await handleCopy(text, author);
        }
        return;
    }

    if (navigator.share) {
      try {
        await navigator.share({ title: 'InspireMe', text: shareText });
      } catch (error) {
        if (error instanceof DOMException && (error.name === 'AbortError' || error.name === 'NotAllowedError')) {
           await handleCopy(text, author);
        } else {
          console.error("Erro ao compartilhar, usando fallback de cópia:", error);
          await handleCopy(text, author);
        }
      }
    } else {
      await handleCopy(text, author);
    }
  };

  const handleShareMeme = (quote: QuoteWithAuthor) => {
    setQuoteForMeme({ quote, action: 'share' });
  };

  const handlePreviewMeme = (quote: QuoteWithAuthor) => {
    setQuoteForMeme({ quote, action: 'preview' });
  };
  
    const handleGoToEditor = (quote: QuoteWithAuthor) => {
    const params = new URLSearchParams();
    params.set('quote', encodeURIComponent(quote.quote));
    if (quote.category) {
      params.set('category', quote.category);
    }
    if (quote.subCategory) {
      params.set('subCategory', quote.subCategory);
    }
    router.push(`/editor-de-video?${params.toString()}`);
  }
  
  const memeEditorState = quoteForMeme ? getMemeEditorState(quoteForMeme.quote, profile) : null;

  const handleCardSubCategoryClick = (subCategory: string) => {
    router.push(`/frases?subCategory=${encodeURIComponent(subCategory)}&mainCategory=Todos`);
  };

  return (
    <>
      <main className="overflow-y-auto">
          <div className="container mx-auto py-8 px-4">
              <FavoritosHeader />
              {isLoading ? <QuoteSkeleton /> : favoriteQuotes.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {favoriteQuotes.map((quote) => (
                      <QuoteCard 
                          key={quote.id}
                          quote={quote}
                          isFavorited={favorites.includes(quote.id)}
                          onToggleFavorite={toggleFavorite}
                          onPreviewMeme={handlePreviewMeme}
                          onShareMeme={handleShareMeme}
                          onCopy={handleCopy}
                          onShare={handleShare}
                          onGoToEditor={handleGoToEditor}
                          onSubCategoryClick={handleCardSubCategoryClick}
                      />
                  ))}
              </div>
              ) : (
                <FavoritosEmpty />
              )}
          </div>
      </main>
      
      <ClientOnly>
        {quoteForMeme && memeEditorState && (
          <MemeGenerator
            quote={quoteForMeme.quote}
            profile={profile}
            editorState={memeEditorState}
            onClose={() => setQuoteForMeme(null)}
            shareDirectly={quoteForMeme.action === 'share'}
          />
        )}
      </ClientOnly>
    </>
  );
}
