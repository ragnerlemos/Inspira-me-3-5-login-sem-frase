
'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, FileSpreadsheet } from 'lucide-react';
import { useWindowSize } from 'react-use';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/hooks/use-favorites';
import { useHiddenQuotes } from '@/hooks/use-hidden-quotes';
import { useAuth } from '@/firebase/provider';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ClientOnly } from '@/components/client-only';
import { getApiUrl, fetchWithBase } from '@/lib/api-client';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { Clipboard } from '@capacitor/clipboard';
import { App } from '@capacitor/app';
// import { toJpeg } from 'html-to-image';
import { useProfile } from '@/hooks/use-profile';
import type { EditorState } from '../editor-de-video/tipos';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MemeGenerator } from '@/components/meme-generator';
import { MobileCategorySheet } from './components/mobile-category-sheet';
import { QuotesGrid } from './components/quotes-grid';
import { QuotesEmptyState } from './components/quotes-empty-state';

import { FrasesClientPageProps, QuoteWithAuthor } from './types';
import { getMemeEditorState } from './utils';
import { FrasesHeader } from './components/frases-header';
import { FrasesSidebar } from './components/frases-sidebar';
import { QuoteCard } from './components/quote-card';
import { QuoteSkeleton } from './components/quote-skeleton';

export function FrasesClientPage({
  initialQuotes,
  initialMainCategories,
  initialSubCategories,
  pageTitle = "Inspire-se com Frases",
}: FrasesClientPageProps) {
  const [allQuotes, setAllQuotes] = useState<QuoteWithAuthor[]>(initialQuotes);
  const [isLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMainCategory, setSelectedMainCategory] = useState<string>('Todos');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('Todos');
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'recentes' | 'aleatorias' | 'antigas'>('recentes');
  const [randomSeed, setRandomSeed] = useState<number>(0);
  
  const [quoteForMeme, setQuoteForMeme] = useState<{ quote: QuoteWithAuthor; action: 'preview' | 'share'; } | null>(null);

  const { favorites, toggleFavorite } = useFavorites();
  const { hiddenQuotes, hideQuote } = useHiddenQuotes();
  const auth = useAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, [auth]);

  const isAdmin = currentUser?.email === 'efeitosbd@gmail.com';

  const handleGlobalDelete = async (quote: QuoteWithAuthor) => {
    if (!isAdmin) return;
    
    if (!quote.hasId || !quote.sheetName) {
      toast({
        title: "Erro",
        description: "Esta frase não possui um ID permanente e não pode ser excluída do banco de dados.",
        variant: "destructive"
      });
      return;
    }

    if (!confirm(`Tem certeza que deseja excluir esta frase permanentemente do banco de dados?\n\n"${quote.quote}"\n\nIsso afetará todos os usuários.`)) {
      return;
    }

    try {
      const token = await currentUser?.getIdToken();
      if (!token) throw new Error("Não autenticado");

      const res = await fetchWithBase('/api/admin/delete-quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          quoteId: quote.id,
          sheetName: quote.sheetName
        })
      });

      if (res.ok) {
        // Exibir notificação de sucesso
        toast({
          title: "Frase excluída com sucesso.",
        });
        
        // Remover imediatamente do estado local
        setAllQuotes(prev => prev.filter(q => q.id !== quote.id));
        
        // Recarregar dados da planilha para garantir sincronização
        await handleRefreshQuotes(true);
      } else {
        const err = await res.json();
        throw new Error(err.error || "Erro ao excluir");
      }
    } catch (error: any) {
      console.error(error);
      // Notificação de erro com a mensagem da API
      toast({
        title: "Erro ao excluir",
        description: error.message || "Não foi possível excluir a frase.",
        variant: "destructive"
      });
    }
  };
  
  const { toast } = useToast();
  const router = useRouter();
  const { profile } = useProfile();
  
  // Handle hardware back button on mobile
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const setupBackListener = async () => {
        const backListener = await App.addListener('backButton', () => {
            if (selectedSubCategory !== 'Todos' || selectedMainCategory !== 'Todos') {
                setSelectedMainCategory('Todos');
                setSelectedSubCategory('Todos');
            } else if (searchTerm) {
                setSearchTerm('');
            }
        });
        return backListener;
    };

    const listenerPromise = setupBackListener();

    return () => {
        listenerPromise.then(l => l.remove());
    };
  }, [selectedMainCategory, selectedSubCategory, searchTerm]);

  const handleRefreshQuotes = async (silent = false) => {
    setIsRefreshing(true);

    try {
      // Invalida cache no servidor primeiro
      await fetchWithBase('/api/invalidate-cache', { method: 'POST' });
      
      // Busca os novos dados diretamente via API em vez de router.refresh()
      // router.refresh() não atualiza o estado local em builds estáticos/APK
      const response = await fetchWithBase('/api/quotes');
      if (response.ok) {
        const newData = await response.json();
        if (Array.isArray(newData)) {
          setAllQuotes(newData);
        }
      }
      
      if (!silent) {
        toast({ title: 'Dados atualizados', description: 'Os dados da planilha foram recarregados.' });
      }
    } catch (error) {
      console.error('Falha ao atualizar dados:', error);
      if (!silent) {
        toast({ variant: 'destructive', title: 'Erro ao atualizar', description: 'Não foi possível atualizar os dados agora.' });
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Se estiver no APK, fazemos um fetch inicial para garantir dados novos
    if (Capacitor.isNativePlatform()) {
      const loadFreshData = async () => {
        try {
          const response = await fetchWithBase('/api/quotes');
          if (response.ok) {
            const newData = await response.json();
            if (Array.isArray(newData)) {
              setAllQuotes(newData);
            }
          }
        } catch (err) {
          console.error("Erro ao carregar dados frescos no APK:", err);
        }
      };
      loadFreshData();
    }
  }, []);

  useEffect(() => {
    setAllQuotes(initialQuotes);
  }, [initialQuotes]);

  useEffect(() => {
    const mainCatFromUrl = searchParams.get('mainCategory');
    const subCatFromUrl = searchParams.get('subCategory');
    if (mainCatFromUrl) {
      setSelectedMainCategory(mainCatFromUrl);
    }
    if (subCatFromUrl) {
      setSelectedSubCategory(subCatFromUrl);
    }
  }, [searchParams]);
  
  const filteredQuotes = useMemo(() => {
    let quotes = allQuotes;

    if (selectedMainCategory !== 'Todos') {
      quotes = quotes.filter(
        q => q.sheetName === selectedMainCategory || q.category === selectedMainCategory || q.subCategory === selectedMainCategory
      );
    }

    if (selectedSubCategory !== 'Todos') {
      quotes = quotes.filter(
        q => q.category === selectedSubCategory || q.subCategory === selectedSubCategory
      );
    }

    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      quotes = quotes.filter(q => 
          q.quote.toLowerCase().includes(lowercasedTerm) ||
          (q.author && q.author.toLowerCase().includes(lowercasedTerm))
      );
    }
    
    // Filtra frases ocultadas pelo admin (apenas para o admin logado)
    if (isAdmin) {
      quotes = quotes.filter(q => !hiddenQuotes.includes(q.id));
    }
    
    // Sort implementation based on the selected criteria
    const items = [...quotes];
    if (sortBy === 'recentes') {
      items.sort((a, b) => {
        if (a.date && b.date) {
          if (a.date !== b.date) return b.date.localeCompare(a.date);
          if (a.time && b.time) return b.time.localeCompare(a.time);
        }
        const rowA = a.rowNumber ?? 0;
        const rowB = b.rowNumber ?? 0;
        return rowB - rowA;
      });
    } else if (sortBy === 'antigas') {
      items.sort((a, b) => {
        if (a.date && b.date) {
          if (a.date !== b.date) return a.date.localeCompare(b.date);
          if (a.time && b.time) return a.time.localeCompare(b.time);
        }
        const rowA = a.rowNumber ?? 0;
        const rowB = b.rowNumber ?? 0;
        return rowA - rowB;
      });
    } else if (sortBy === 'aleatorias') {
      const rands = new Map<string, number>();
      items.forEach(q => {
        let hash = randomSeed;
        const str = q.id;
        for (let i = 0; i < str.length; i++) {
          hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        rands.set(q.id, Math.sin(hash));
      });
      items.sort((a, b) => (rands.get(a.id) ?? 0) - (rands.get(b.id) ?? 0));
    }

    return items;

  }, [allQuotes, searchTerm, selectedMainCategory, selectedSubCategory, sortBy, randomSeed, hiddenQuotes, isAdmin]);

  
  const handleShareMeme = (quote: QuoteWithAuthor) => {
    setQuoteForMeme({ quote, action: 'share' });
  };


  const handlePreviewMeme = (quote: QuoteWithAuthor) => {
    setQuoteForMeme({ quote, action: 'preview' });
  };
  
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
    const shareText = author ? `${text} - ${author}` : text;

    if (Capacitor.isNativePlatform()) {
        try {
            await Share.share({
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
        await navigator.share({
          text: shareText,
        });
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

  const handleMainCategorySelect = (mainCategory: string) => {
    setSelectedMainCategory(mainCategory);
    setSelectedSubCategory('Todos');
    
    if (mainCategory === 'Todos' && window.innerWidth < 768) {
      setIsCategorySheetOpen(false);
    }
  };

  const handleSubCategorySelect = (mainCategory: string, subCategory: string) => {
    setSelectedMainCategory(mainCategory);
    setSelectedSubCategory(subCategory);
    if (window.innerWidth < 768) {
      setIsCategorySheetOpen(false);
    }
  };
  
  const handleCardSubCategoryClick = (subCategory: string) => {
    setSelectedMainCategory('Todos');
    setSelectedSubCategory(subCategory);
    if (isCategorySheetOpen) {
      setIsCategorySheetOpen(false);
    }
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
    const breadcrumbSubCategories = initialSubCategories[selectedMainCategory] || [];
  
  return (
    <>
      <MobileCategorySheet 
        isOpen={isCategorySheetOpen}
        onOpenChange={setIsCategorySheetOpen}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        isRefreshing={isRefreshing}
        onRefresh={handleRefreshQuotes}
        selectedMainCategory={selectedMainCategory}
        selectedSubCategory={selectedSubCategory}
        initialMainCategories={initialMainCategories}
        initialSubCategories={initialSubCategories}
        onMainCategorySelect={handleMainCategorySelect}
        onSubCategorySelect={handleSubCategorySelect}
      />

      <main className="overflow-y-auto safe-area py-8">
        <div className="grid md:grid-cols-[280px_1fr] gap-8 md:items-start">
          <aside className="hidden md:block pl-4">
            <div className="sticky top-24">
              <ScrollArea type="always" className="max-h-[calc(100vh-10rem)] -mr-4 pr-4" style={{ height: '600px' }}>
                <FrasesSidebar
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  isRefreshing={isRefreshing}
                  onRefresh={handleRefreshQuotes}
                  selectedMainCategory={selectedMainCategory}
                  selectedSubCategory={selectedSubCategory}
                  initialMainCategories={initialMainCategories}
                  initialSubCategories={initialSubCategories}
                  onMainCategorySelect={handleMainCategorySelect}
                  onSubCategorySelect={handleSubCategorySelect}
                />
              </ScrollArea>
            </div>
          </aside>
          <div className="px-4">
            <FrasesHeader
              pageTitle={pageTitle}
              selectedMainCategory={selectedMainCategory}
              selectedSubCategory={selectedSubCategory}
              searchTerm={searchTerm}
              sortBy={sortBy}
              isRefreshing={isRefreshing}
              breadcrumbSubCategories={breadcrumbSubCategories}
              onClearFilters={() => {
                setSelectedMainCategory('Todos');
                setSelectedSubCategory('Todos');
                setSearchTerm('');
              }}
              onSortChange={(sort) => {
                setSortBy(sort);
                if (sort === 'aleatorias') setRandomSeed(Date.now());
              }}
              onRefresh={handleRefreshQuotes}
              onOpenMobileCategories={() => setIsCategorySheetOpen(true)}
              onSubCategorySelect={handleSubCategorySelect}
              onMainCategorySelect={handleMainCategorySelect}
              onClearSearch={() => setSearchTerm('')}
            />
            
            {isLoading ? (
              <QuoteSkeleton />
            ) : filteredQuotes.length > 0 ? (
              <QuotesGrid 
                quotes={filteredQuotes}
                favorites={favorites}
                isAdmin={isAdmin}
                onToggleFavorite={toggleFavorite}
                onPreviewMeme={handlePreviewMeme}
                onCopy={handleCopy}
                onShareMeme={handleShareMeme}
                onGoToEditor={handleGoToEditor}
                onShareText={handleShare}
                onGlobalDelete={handleGlobalDelete}
                onSubCategoryClick={handleCardSubCategoryClick}
              />
            ) : allQuotes.length === 0 ? (
              <QuotesEmptyState type="no-data" />
            ) : (
              <QuotesEmptyState type="no-results" />
            )}
          </div>
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
            onCopy={handleCopy}
          />
        )}
      </ClientOnly>
    </>
  );
}
