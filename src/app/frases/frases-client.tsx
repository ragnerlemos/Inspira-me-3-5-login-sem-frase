
'use client';

import { useState, useMemo, useRef, useEffect, useTransition, useCallback } from 'react';
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
import { useTemplates } from '@/hooks/use-templates';
import type { EditorState } from '../editor-de-video/tipos';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MemeGenerator } from '@/components/meme-generator';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { MobileCategorySheet } from './components/mobile-category-sheet';
import { QuotesGrid } from './components/quotes-grid';
import { QuotesEmptyState } from './components/quotes-empty-state';

import { FrasesClientPageProps, QuoteWithAuthor, GlobalSubCategory } from './types';
import { getMemeEditorState } from './utils';
import { FrasesHeader } from './components/frases-header';
import { FrasesSidebar } from './components/frases-sidebar';
import { QuoteCard } from './components/quote-card';
import { QuoteSkeleton } from './components/quote-skeleton';

export function FrasesClientPage({
  initialQuotes,
  initialMainCategories,
  initialHierarchy,
  pageTitle = "Inspire-se com Frases",
}: FrasesClientPageProps) {
  const [allQuotes, setAllQuotes] = useState<QuoteWithAuthor[]>(initialQuotes);
  const [isLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [, startTransition] = useTransition();
  const [selectedMainCategory, setSelectedMainCategory] = useState<string>('Todos');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('Todos');
  const [selectedSubSubCategory, setSelectedSubSubCategory] = useState<string>('Todos');
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);
  const [highlightedQuoteId, setHighlightedQuoteId] = useState<string | null>(null);
  const [quoteToDelete, setQuoteToDelete] = useState<QuoteWithAuthor | null>(null);
  const [sortBy, setSortBy] = useState<'recentes' | 'aleatorias' | 'antigas'>('recentes');
  const [randomSeed, setRandomSeed] = useState<number>(0);
  
  const { templates } = useTemplates();
  const layouts = templates.filter(t => !t.isCustom);
  const backgrounds = templates.filter(t => t.isCustom);

  const [globalLayoutId, setGlobalLayoutId] = useState<string>('template-twitter');
  const [globalBackgroundId, setGlobalBackgroundId] = useState<string>('');
  
  const handleSelectLayout = useCallback((quoteId: string, templateId: string) => {
    setGlobalLayoutId(templateId);
  }, []);
  const handleSelectBackground = useCallback((quoteId: string, templateId: string) => {
    setGlobalBackgroundId(templateId);
  }, []);
  
  const [quoteForMeme, setQuoteForMeme] = useState<{ quote: QuoteWithAuthor; action: 'preview' | 'share'; layoutId?: string; backgroundId?: string } | null>(null);

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

  const handleQuickEditQuote = async (quote: QuoteWithAuthor, newText: string): Promise<boolean> => {
    try {
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : '';

      const res = await fetchWithBase('/api/admin/update-quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          quoteId: quote.id,
          sheetName: quote.sheetName,
          rowNumber: quote.rowNumber,
          quote: newText,
          author: quote.author || '',
          category: quote.category || '',
          subCategory: quote.subCategory || '',
          intro: quote.intro || '',
          conclusion: quote.conclusion || '',
          description: quote.description || '',
          music: quote.music || ''
        })
      });

      if (res.ok) {
        toast({
          title: "Frase atualizada com sucesso!",
          description: "O card foi atualizado na tela e na planilha."
        });

        // Atualiza imediatamente no estado local
        setAllQuotes(prev => prev.map(q => q.id === quote.id ? { ...q, quote: newText } : q));
        return true;
      } else {
        const err = await res.json();
        throw new Error(err.error || "Erro ao atualizar frase.");
      }
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Erro ao salvar alteração",
        description: error.message || "Não foi possível atualizar a frase.",
        variant: "destructive"
      });
      return false;
    }
  };

  const handleGlobalDelete = (quote: QuoteWithAuthor) => {
    if (!isAdmin) return;
    
    if (!quote.hasId || !quote.sheetName) {
      toast({
        title: "Erro",
        description: "Esta frase não possui um ID permanente e não pode ser excluída do banco de dados.",
        variant: "destructive"
      });
      return;
    }

    setQuoteToDelete(quote);
  };

  const executeGlobalDelete = async () => {
    if (!quoteToDelete) return;
    const quote = quoteToDelete;
    setQuoteToDelete(null);

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
          sheetName: quote.sheetName,
          rowNumber: quote.rowNumber
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
    const subSubCatFromUrl = searchParams.get('subSubCategory');
    if (mainCatFromUrl) {
      setSelectedMainCategory(mainCatFromUrl);
    }
    if (subCatFromUrl) {
      setSelectedSubCategory(subCatFromUrl);
    }
    if (subSubCatFromUrl) {
      setSelectedSubSubCategory(subSubCatFromUrl);
    }
  }, [searchParams]);

  // Efeito para recarregar dados frescos se veio de cadastro recente via sessionStorage
  useEffect(() => {
    try {
      const lastAddedStr = sessionStorage.getItem('inspire_last_added_quote');
      if (lastAddedStr) {
        sessionStorage.removeItem('inspire_last_added_quote');
        handleRefreshQuotes(true);
      }
    } catch {}
  }, []);

  // Efeito para destacar e rolar a tela até o card da frase recém-adicionada ou indicada na URL
  useEffect(() => {
    const highlight = searchParams.get('highlight');
    const quoteQuery = searchParams.get('q');
    if (!highlight && !quoteQuery) return;

    if (allQuotes.length === 0) return;

    const target = allQuotes.find(q => {
      if (highlight) {
        if (q.id === highlight) return true;
        if (q.id.endsWith(`-${highlight}`)) return true;
        if (String(q.id).toLowerCase() === String(highlight).toLowerCase()) return true;
      }
      if (quoteQuery && q.quote.toLowerCase().includes(quoteQuery.toLowerCase().trim())) {
        return true;
      }
      return false;
    });

    if (!target && (highlight || quoteQuery)) {
      handleRefreshQuotes(true);
      return;
    }

    if (target) {
      setHighlightedQuoteId(target.id);

      // Se a frase pertence a uma aba específica e o filtro atual não a exibe, ajusta a aba
      if (target.sheetName && selectedMainCategory !== 'Todos' && selectedMainCategory !== target.sheetName) {
        setSelectedMainCategory(target.sheetName);
      }

      // Scroll suave até o elemento
      const scrollTimer = setTimeout(() => {
        const el = document.getElementById(`quote-card-${target.id}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 400);

      // Desliga o destaque depois de 8 segundos
      const unhighlightTimer = setTimeout(() => {
        setHighlightedQuoteId(null);
      }, 8000);

      return () => {
        clearTimeout(scrollTimer);
        clearTimeout(unhighlightTimer);
      };
    }
  }, [allQuotes, searchParams, selectedMainCategory]);
  
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const visibleQuotes = isAdmin ? allQuotes.filter(q => !hiddenQuotes.includes(q.id)) : allQuotes;

    counts['Todos'] = visibleQuotes.length;

    visibleQuotes.forEach((q) => {
      if (q.sheetName) {
        counts[q.sheetName] = (counts[q.sheetName] || 0) + 1;
        
        const cat1 = q.subCategory?.trim() || 'Geral';
        counts[`${q.sheetName}-${cat1}`] = (counts[`${q.sheetName}-${cat1}`] || 0) + 1;

        if (q.category) {
          const cat2 = q.category.trim();
          counts[`${q.sheetName}-${cat1}-${cat2}`] = (counts[`${q.sheetName}-${cat1}-${cat2}`] || 0) + 1;
        }
      }
    });

    return counts;
  }, [allQuotes, hiddenQuotes, isAdmin]);

  const globalSubCategories = useMemo<GlobalSubCategory[]>(() => {
    const visibleQuotes = isAdmin ? allQuotes.filter(q => !hiddenQuotes.includes(q.id)) : allQuotes;

    const subMap = new Map<string, { displayName: string; quotes: QuoteWithAuthor[] }>();

    visibleQuotes.forEach((q) => {
      const catsInQuote = new Set<string>();
      if (q.subCategory?.trim() && q.subCategory.trim().toLowerCase() !== 'geral') {
        catsInQuote.add(q.subCategory.trim());
      }
      if (q.category?.trim() && q.category.trim().toLowerCase() !== 'geral') {
        catsInQuote.add(q.category.trim());
      }

      catsInQuote.forEach((rawCat) => {
        const normKey = rawCat.toLowerCase();
        if (!subMap.has(normKey)) {
          const formatted = rawCat.charAt(0).toUpperCase() + rawCat.slice(1);
          subMap.set(normKey, { displayName: formatted, quotes: [] });
        }
        subMap.get(normKey)!.quotes.push(q);
      });
    });

    const result: GlobalSubCategory[] = [];

    subMap.forEach(({ displayName, quotes }, normalizedKey) => {
      const contextMap = new Map<string, { name: string; count: number }>();

      quotes.forEach((q) => {
        const cat1 = q.subCategory?.trim() || '';
        const cat2 = q.category?.trim() || '';
        const norm1 = cat1.toLowerCase();
        const norm2 = cat2.toLowerCase();

        let ctxName = '';

        if (q.sheetName === 'Datas Comemorativas') {
          const other = norm1 === normalizedKey ? cat2 : cat1;
          if (other && other.toLowerCase() !== normalizedKey && other.toLowerCase() !== 'geral') {
            ctxName = other;
          } else {
            ctxName = 'Datas Comemorativas';
          }
        } else {
          const other = norm1 === normalizedKey ? cat2 : cat1;
          if (other && other.toLowerCase() !== normalizedKey && other.toLowerCase() !== 'geral') {
            ctxName = other;
          } else {
            ctxName = q.sheetName || 'Outros';
          }
        }

        if (ctxName) {
          const ctxKey = ctxName.toLowerCase();
          const formattedCtx = ctxName.charAt(0).toUpperCase() + ctxName.slice(1);
          if (!contextMap.has(ctxKey)) {
            contextMap.set(ctxKey, { name: formattedCtx, count: 0 });
          }
          contextMap.get(ctxKey)!.count += 1;
        }
      });

      const contexts = Array.from(contextMap.values()).sort((a, b) => a.name.localeCompare(b.name));

      result.push({
        name: displayName,
        normalizedKey,
        totalCount: quotes.length,
        contexts
      });
    });

    return result.sort((a, b) => a.name.localeCompare(b.name));
  }, [allQuotes, hiddenQuotes, isAdmin]);

  const filteredQuotes = useMemo(() => {
    let quotes = allQuotes;

    if (selectedMainCategory && selectedMainCategory.toLowerCase() !== 'todos') {
      const targetMainLower = selectedMainCategory.toLowerCase().trim();
      quotes = quotes.filter(q => {
        const sheetMatch = q.sheetName && q.sheetName.toLowerCase().trim() === targetMainLower;
        const catMatch = (q.category && q.category.toLowerCase().trim() === targetMainLower) ||
                         (q.subCategory && q.subCategory.toLowerCase().trim() === targetMainLower);
        return sheetMatch || catMatch;
      });
    }

    if (selectedSubCategory.toLowerCase().trim() !== 'todos') {
      const targetSubLower = selectedSubCategory.toLowerCase().trim();

      quotes = quotes.filter(q => {
        const cat1 = q.subCategory?.trim() || '';
        const cat2 = q.category?.trim() || '';
        const norm1 = cat1.toLowerCase();
        const norm2 = cat2.toLowerCase();

        const hasSub = norm1 === targetSubLower || norm2 === targetSubLower;
        if (!hasSub) return false;

        if (selectedSubSubCategory.toLowerCase().trim() !== 'todos') {
          const targetCtxLower = selectedSubSubCategory.toLowerCase().trim();

          let ctxName = '';
          if (q.sheetName === 'Datas Comemorativas') {
            const other = norm1 === targetSubLower ? cat2 : cat1;
            if (other && other.toLowerCase() !== targetSubLower && other.toLowerCase() !== 'geral') {
              ctxName = other;
            } else {
              ctxName = 'Datas Comemorativas';
            }
          } else {
            const other = norm1 === targetSubLower ? cat2 : cat1;
            if (other && other.toLowerCase() !== targetSubLower && other.toLowerCase() !== 'geral') {
              ctxName = other;
            } else {
              ctxName = q.sheetName || 'Outros';
            }
          }

          return ctxName.toLowerCase() === targetCtxLower;
        }

        return true;
      });
    }

    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase().trim();
      const cleanTermNumber = lowercasedTerm.replace(/^#/, '');
      quotes = quotes.filter(q => 
          q.quote.toLowerCase().includes(lowercasedTerm) ||
          (q.author && q.author.toLowerCase().includes(lowercasedTerm)) ||
          (q.category && q.category.toLowerCase().includes(lowercasedTerm)) ||
          (q.subCategory && q.subCategory.toLowerCase().includes(lowercasedTerm)) ||
          (q.sheetName && q.sheetName.toLowerCase().includes(lowercasedTerm)) ||
          (q.id && q.id.toLowerCase().includes(lowercasedTerm)) ||
          (cleanTermNumber && q.rowNumber !== undefined && q.rowNumber.toString() === cleanTermNumber)
      );
    }
    
    // Filtra frases ocultadas pelo admin (apenas para o admin logado)
    if (isAdmin) {
      quotes = quotes.filter(q => !hiddenQuotes.includes(q.id));
    }
    
    // Sort implementation based on the selected criteria
    const parseDateTimeToTimestamp = (dateStr?: string, timeStr?: string): number => {
      if (!dateStr && !timeStr) return 0;
      let y = 0, m = 0, d = 0;
      if (dateStr) {
        const cleanDate = dateStr.trim();
        if (cleanDate.includes('-')) {
          const parts = cleanDate.split('-');
          if (parts.length === 3) {
            y = parseInt(parts[0], 10) || 0;
            m = parseInt(parts[1], 10) || 0;
            d = parseInt(parts[2], 10) || 0;
          }
        } else if (cleanDate.includes('/')) {
          const parts = cleanDate.split('/');
          if (parts.length === 3) {
            d = parseInt(parts[0], 10) || 0;
            m = parseInt(parts[1], 10) || 0;
            y = parseInt(parts[2], 10) || 0;
          }
        }
      }
      let hh = 0, mm = 0, ss = 0;
      if (timeStr) {
        const timeParts = timeStr.trim().split(':');
        hh = parseInt(timeParts[0], 10) || 0;
        mm = parseInt(timeParts[1], 10) || 0;
        ss = parseInt(timeParts[2], 10) || 0;
      }
      if (y > 0 && m > 0 && d > 0) {
        return new Date(y, m - 1, d, hh, mm, ss).getTime();
      }
      return 0;
    };

    const items = [...quotes];
    if (sortBy === 'recentes') {
      items.sort((a, b) => {
        const timeA = parseDateTimeToTimestamp(a.date, a.time);
        const timeB = parseDateTimeToTimestamp(b.date, b.time);
        if (timeA !== timeB) return timeB - timeA;
        
        return (b.rowNumber ?? 0) - (a.rowNumber ?? 0);
      });
    } else if (sortBy === 'antigas') {
      items.sort((a, b) => {
        const timeA = parseDateTimeToTimestamp(a.date, a.time);
        const timeB = parseDateTimeToTimestamp(b.date, b.time);
        if (timeA !== timeB) return timeA - timeB;
        
        return (a.rowNumber ?? 0) - (b.rowNumber ?? 0);
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

  }, [allQuotes, searchTerm, selectedMainCategory, selectedSubCategory, selectedSubSubCategory, sortBy, randomSeed, hiddenQuotes, isAdmin]);

  
  const handleShareMeme = useCallback((quote: QuoteWithAuthor, layoutId?: string, backgroundId?: string) => {
    setQuoteForMeme({ quote, action: 'share', layoutId, backgroundId });
  }, []);

  const handlePreviewMeme = useCallback((quote: QuoteWithAuthor, layoutId?: string, backgroundId?: string) => {
    setQuoteForMeme({ quote, action: 'preview', layoutId, backgroundId });
  }, []);
  
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
    const isMain = initialMainCategories.some(c => c.toLowerCase().trim() === mainCategory.toLowerCase().trim());
    if (!isMain && mainCategory.toLowerCase().trim() !== 'todos') {
      setSelectedMainCategory('Todos');
      setSelectedSubCategory(mainCategory);
      setSelectedSubSubCategory('Todos');
      return;
    }
    const canonicalMain = mainCategory.toLowerCase().trim() === 'todos'
      ? 'Todos'
      : (initialMainCategories.find(c => c.toLowerCase().trim() === mainCategory.toLowerCase().trim()) || mainCategory);

    // Verifica se a categoria possui subcategorias
    const matchingKey = canonicalMain !== 'Todos'
      ? Object.keys(initialHierarchy).find(k => k.toLowerCase().trim() === canonicalMain.toLowerCase().trim())
      : undefined;
    const subCategories = matchingKey && initialHierarchy[matchingKey]
      ? Object.keys(initialHierarchy[matchingKey]).filter(s => s && s.trim() && s.toLowerCase().trim() !== 'geral')
      : [];

    // Só fecha a gaveta no mobile se NÃO houver subcategorias para o usuário escolher.
    // Se houver subcategorias, mantém o menu aberto para que ele possa escolher os submenus!
    if (subCategories.length === 0 && typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsCategorySheetOpen(false);
    }

    setSelectedMainCategory(canonicalMain);
    setSelectedSubCategory('Todos');
    setSelectedSubSubCategory('Todos');
  };

  const handleCardCategoryClick = (category: string) => {
    if (isCategorySheetOpen) {
      setIsCategorySheetOpen(false);
    }
    const isMain = initialMainCategories.some(c => c.toLowerCase().trim() === category.toLowerCase().trim());
    if (isMain) {
      const canonicalMain = initialMainCategories.find(c => c.toLowerCase().trim() === category.toLowerCase().trim()) || category;
      setSelectedMainCategory(canonicalMain);
      setSelectedSubCategory('Todos');
      setSelectedSubSubCategory('Todos');
    } else {
      setSelectedMainCategory('Todos');
      setSelectedSubCategory(category);
      setSelectedSubSubCategory('Todos');
    }
  };

  const handleSubCategorySelect = (mainCategory: string, subCategory: string) => {
    const canonicalMain = mainCategory.toLowerCase().trim() === 'todos'
      ? 'Todos'
      : (initialMainCategories.find(c => c.toLowerCase().trim() === mainCategory.toLowerCase().trim()) || mainCategory);

    // Verificar se a subcategoria possui sub-subcategorias (subopções para o usuário escolher)
    let hasChildren = false;
    if (canonicalMain !== 'Todos') {
      const matchingMain = Object.keys(initialHierarchy).find(k => k.toLowerCase().trim() === canonicalMain.toLowerCase().trim());
      if (matchingMain && initialHierarchy[matchingMain]) {
        const matchingSub = Object.keys(initialHierarchy[matchingMain]).find(s => s.toLowerCase().trim() === subCategory.toLowerCase().trim());
        if (matchingSub && initialHierarchy[matchingMain][matchingSub]?.length > 0) {
          hasChildren = true;
        }
      }
    } else {
      const globalItem = globalSubCategories.find(g => g.normalizedKey === subCategory.toLowerCase().trim());
      if (globalItem && globalItem.contexts && globalItem.contexts.length > 0) {
        hasChildren = true;
      }
    }

    // Se NÃO houver subníveis a escolher, fecha o menu no mobile para exibir as frases.
    // Se houver opções de submenus, mantém o menu aberto!
    if (!hasChildren && typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsCategorySheetOpen(false);
    }

    setSelectedMainCategory(canonicalMain);
    setSelectedSubCategory(subCategory);
    setSelectedSubSubCategory('Todos');
  };

  const handleSubSubCategorySelect = (mainCategory: string, subCategory: string, subSubCategory: string) => {
    const canonicalMain = mainCategory.toLowerCase().trim() === 'todos'
      ? 'Todos'
      : (initialMainCategories.find(c => c.toLowerCase().trim() === mainCategory.toLowerCase().trim()) || mainCategory);
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsCategorySheetOpen(false);
    }
    setSelectedMainCategory(canonicalMain);
    setSelectedSubCategory(subCategory);
    setSelectedSubSubCategory(subSubCategory);
  };
  
  const handleCardSubCategoryClick = (subCategory: string) => {
    if (isCategorySheetOpen) {
      setIsCategorySheetOpen(false);
    }
    setSelectedMainCategory('Todos');
    setSelectedSubCategory(subCategory);
    setSelectedSubSubCategory('Todos');
  };
  
  const handleGoToEditor = useCallback((quote: QuoteWithAuthor, layoutId?: string, backgroundId?: string) => {
    const params = new URLSearchParams();
    params.set('quote', encodeURIComponent(quote.quote));
    if (layoutId) {
      params.set('layoutId', layoutId);
    }
    if (backgroundId) {
      params.set('backgroundId', backgroundId);
    }
    if (quote.category) {
      params.set('category', quote.category);
    }
    if (quote.subCategory) {
      params.set('subCategory', quote.subCategory);
    }
    router.push(`/editor-de-video?${params.toString()}`);
  }, [router]);

  const handleEditCadastro = useCallback((quote: QuoteWithAuthor) => {
    const params = new URLSearchParams();
    params.set('quote', quote.quote);
    if (quote.author) params.set('author', quote.author);
    if (quote.sheetName) params.set('sheet', quote.sheetName);
    if (quote.category) params.set('cat', quote.category);
    if (quote.subCategory) params.set('subcat', quote.subCategory);
    if (quote.intro) params.set('intro', quote.intro);
    if (quote.conclusion) params.set('conclusion', quote.conclusion);
    if (quote.music) params.set('music', quote.music);
    if (quote.description) params.set('desc', quote.description);
    if (quote.id) params.set('id', quote.id);
    if (quote.rowNumber) params.set('row', quote.rowNumber.toString());
    
    router.push(`/cadastro?${params.toString()}`);
  }, [router]);

  const selectedLayoutTemplate = quoteForMeme?.layoutId ? templates.find(t => t.id === quoteForMeme.layoutId) : undefined;
  const selectedBackgroundTemplate = quoteForMeme?.backgroundId ? templates.find(t => t.id === quoteForMeme.backgroundId) : undefined;
  const memeEditorState = quoteForMeme ? getMemeEditorState(quoteForMeme.quote, profile, selectedLayoutTemplate, selectedBackgroundTemplate) : null;
  const matchingHierarchyKey = selectedMainCategory.toLowerCase() !== 'todos'
    ? Object.keys(initialHierarchy).find(k => k.toLowerCase().trim() === selectedMainCategory.toLowerCase().trim())
    : undefined;
  const currentHierarchySubs = matchingHierarchyKey ? (initialHierarchy[matchingHierarchyKey] || {}) : (initialHierarchy[selectedMainCategory] || {});
  const breadcrumbSubCategories = selectedMainCategory.toLowerCase() !== 'todos' ? Object.keys(currentHierarchySubs).sort() : [];
  const breadcrumbSubSubCategories = (selectedMainCategory.toLowerCase() !== 'todos' && selectedSubCategory.toLowerCase() !== 'todos')
    ? (currentHierarchySubs[selectedSubCategory] ||
       currentHierarchySubs[Object.keys(currentHierarchySubs).find(k => k.toLowerCase().trim() === selectedSubCategory.toLowerCase().trim()) || ''] || [])
    : [];

  const availableSubCategories = useMemo<{ name: string; count?: number }[]>(() => {
    if (selectedMainCategory.toLowerCase() === 'todos') {
      return globalSubCategories.map(g => ({
        name: g.name,
        count: g.totalCount
      })).sort((a, b) => a.name.localeCompare(b.name));
    }

    const matchingKey = Object.keys(initialHierarchy).find(
      k => k.toLowerCase().trim() === selectedMainCategory.toLowerCase().trim()
    );
    const catSubs = matchingKey ? (initialHierarchy[matchingKey] || {}) : (initialHierarchy[selectedMainCategory] || {});
    const subNames = Object.keys(catSubs).filter(s => s.toLowerCase() !== 'geral');

    if (subNames.length > 0) {
      const canonicalKey = matchingKey || selectedMainCategory;
      return subNames.map(subName => {
        const count = categoryCounts[`${canonicalKey}-${subName}`] ?? categoryCounts[`${selectedMainCategory}-${subName}`];
        return {
          name: subName,
          count: count !== undefined ? count : undefined
        };
      }).sort((a, b) => a.name.localeCompare(b.name));
    }

    const targetMainLower = selectedMainCategory.toLowerCase().trim();
    const visibleQuotes = isAdmin ? allQuotes.filter(q => !hiddenQuotes.includes(q.id)) : allQuotes;
    const subMap = new Map<string, { name: string; count: number }>();

    visibleQuotes.forEach(q => {
      if (q.sheetName && q.sheetName.toLowerCase().trim() === targetMainLower) {
        const cat1 = q.subCategory?.trim() || '';
        const cat2 = q.category?.trim() || '';
        [cat1, cat2].forEach(cat => {
          if (cat && cat.toLowerCase() !== 'geral') {
            const key = cat.toLowerCase();
            const formatted = cat.charAt(0).toUpperCase() + cat.slice(1);
            if (!subMap.has(key)) {
              subMap.set(key, { name: formatted, count: 0 });
            }
            subMap.get(key)!.count += 1;
          }
        });
      }
    });

    return Array.from(subMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [selectedMainCategory, initialHierarchy, globalSubCategories, categoryCounts, allQuotes, hiddenQuotes, isAdmin]);

  const activeGlobalSub = useMemo(() => {
    if (selectedSubCategory === 'Todos') return null;
    const subLower = selectedSubCategory.toLowerCase().trim();
    return globalSubCategories.find(g => g.normalizedKey === subLower || g.name.toLowerCase().trim() === subLower) || null;
  }, [globalSubCategories, selectedSubCategory]);

  const subCategoryOptions = useMemo<{ name: string; count?: number }[]>(() => {
    if (selectedSubCategory === 'Todos') return [];

    const optionsMap = new Map<string, { name: string; count?: number }>();

    // 1. Contextos da subcategoria global (com contagens reais)
    if (activeGlobalSub && activeGlobalSub.contexts.length > 0) {
      activeGlobalSub.contexts.forEach(ctx => {
        optionsMap.set(ctx.name.toLowerCase(), { ...ctx });
      });
    }

    // 2. Hierarquia da aba selecionada (ou de qualquer aba se estiver em Todos)
    if (selectedMainCategory.toLowerCase() !== 'todos') {
      const hierarchySubs = matchingHierarchyKey ? (initialHierarchy[matchingHierarchyKey] || {}) : (initialHierarchy[selectedMainCategory] || {});
      const matchingKey = Object.keys(hierarchySubs).find(k => k.toLowerCase() === selectedSubCategory.toLowerCase().trim());
      if (matchingKey && hierarchySubs[matchingKey]) {
        hierarchySubs[matchingKey].forEach(name => {
          const key = name.toLowerCase();
          if (!optionsMap.has(key)) {
            optionsMap.set(key, { name });
          }
        });
      }
    }

    // 3. Fallback dinâmico diretamente nas frases:
    // Garante que mesmo quando há apenas 1 frase e 1 categoria interna (ex: Abacate -> Notícia ou Notícia -> Abacate), ela sempre é encontrada
    const subLower = selectedSubCategory.toLowerCase().trim();
    const visibleQuotes = isAdmin ? allQuotes.filter(q => !hiddenQuotes.includes(q.id)) : allQuotes;
    visibleQuotes.forEach(q => {
      const cat1 = q.subCategory?.trim() || '';
      const cat2 = q.category?.trim() || '';
      const norm1 = cat1.toLowerCase();
      const norm2 = cat2.toLowerCase();

      if (norm1 === subLower || norm2 === subLower) {
        let other = norm1 === subLower ? cat2 : cat1;
        if (!other || other.toLowerCase() === subLower || other.toLowerCase() === 'geral') {
          if (q.sheetName && q.sheetName.toLowerCase() !== 'todos') {
            other = q.sheetName;
          }
        }
        if (other && other.toLowerCase() !== subLower && other.toLowerCase() !== 'geral') {
          const otherKey = other.toLowerCase();
          const formatted = other.charAt(0).toUpperCase() + other.slice(1);
          if (!optionsMap.has(otherKey)) {
            optionsMap.set(otherKey, { name: formatted, count: 0 });
          }
          optionsMap.get(otherKey)!.count = (optionsMap.get(otherKey)!.count || 0) + 1;
        }
      }
    });

    return Array.from(optionsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [selectedSubCategory, selectedMainCategory, activeGlobalSub, initialHierarchy, matchingHierarchyKey, allQuotes, hiddenQuotes, isAdmin]);
  
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
        selectedSubSubCategory={selectedSubSubCategory}
        initialMainCategories={initialMainCategories}
        initialHierarchy={initialHierarchy}
        onMainCategorySelect={handleMainCategorySelect}
        onSubCategorySelect={handleSubCategorySelect}
        onSubSubCategorySelect={handleSubSubCategorySelect}
        categoryCounts={categoryCounts}
        globalSubCategories={globalSubCategories}
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
                  selectedSubSubCategory={selectedSubSubCategory}
                  initialMainCategories={initialMainCategories}
                  initialHierarchy={initialHierarchy}
                  onMainCategorySelect={handleMainCategorySelect}
                  onSubCategorySelect={handleSubCategorySelect}
                  onSubSubCategorySelect={handleSubSubCategorySelect}
                  categoryCounts={categoryCounts}
                  globalSubCategories={globalSubCategories}
                />
              </ScrollArea>
            </div>
          </aside>
          <div className="px-4">
            <FrasesHeader
              pageTitle={pageTitle}
              selectedMainCategory={selectedMainCategory}
              selectedSubCategory={selectedSubCategory}
              selectedSubSubCategory={selectedSubSubCategory}
              initialMainCategories={initialMainCategories}
              searchTerm={searchTerm}
              sortBy={sortBy}
              isRefreshing={isRefreshing}
              breadcrumbSubCategories={breadcrumbSubCategories}
              breadcrumbSubSubCategories={breadcrumbSubSubCategories}
              availableSubCategories={availableSubCategories}
              subCategoryOptions={subCategoryOptions}
              onClearFilters={() => {
                setSelectedMainCategory('Todos');
                setSelectedSubCategory('Todos');
                setSelectedSubSubCategory('Todos');
                setSearchTerm('');
              }}
              onSortChange={(sort) => {
                setSortBy(sort);
                if (sort === 'aleatorias') setRandomSeed(Date.now());
              }}
              onRefresh={handleRefreshQuotes}
              onOpenMobileCategories={() => setIsCategorySheetOpen(true)}
              onSubCategorySelect={handleSubCategorySelect}
              onSubSubCategorySelect={handleSubSubCategorySelect}
              onMainCategorySelect={handleMainCategorySelect}
              onClearSearch={() => setSearchTerm('')}
              onSearchChange={setSearchTerm}
            />
            
            {isLoading ? (
              <QuoteSkeleton />
            ) : filteredQuotes.length > 0 ? (
              <QuotesGrid 
                quotes={filteredQuotes}
                favorites={favorites}
                isAdmin={isAdmin}
                highlightedQuoteId={highlightedQuoteId}
                layouts={layouts}
                backgrounds={backgrounds}
                cardLayouts={Object.fromEntries(filteredQuotes.map(q => [q.id, globalLayoutId]))}
                cardBackgrounds={Object.fromEntries(filteredQuotes.map(q => [q.id, globalBackgroundId]))}
                onSelectLayout={handleSelectLayout}
                onSelectBackground={handleSelectBackground}
                onToggleFavorite={toggleFavorite}
                onPreviewMeme={handlePreviewMeme}
                onCopy={handleCopy}
                onShareMeme={handleShareMeme}
                onGoToEditor={handleGoToEditor}
                onEditCadastro={handleEditCadastro}
                onQuickEditQuote={handleQuickEditQuote}
                onShareText={handleShare}
                onGlobalDelete={handleGlobalDelete}
                onSubCategoryClick={handleCardSubCategoryClick}
                onMainCategoryClick={handleCardCategoryClick}
              />
            ) : allQuotes.length === 0 ? (
              <QuotesEmptyState type="no-data" />
            ) : (
              <QuotesEmptyState type="no-results" />
            )}
          </div>
        </div>
      </main>

      <AlertDialog open={!!quoteToDelete} onOpenChange={(open) => !open && setQuoteToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Frase</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta frase permanentemente do banco de dados?
              <br/><br/>
              <span className="italic">"{quoteToDelete?.quote}"</span>
              <br/><br/>
              Esta ação não pode ser desfeita e afetará todos os usuários.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={executeGlobalDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Sim, excluir do banco
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
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
