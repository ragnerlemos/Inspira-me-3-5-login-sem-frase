
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2, Copy, ExternalLink } from 'lucide-react';
import { fetchWithBase } from '@/lib/api-client';
import { Capacitor } from '@capacitor/core';
import { useAuth } from '@/firebase/provider';
import { useProfile } from '@/hooks/use-profile';
import { cn } from '@/lib/utils';
import type { SheetHierarchy } from '@/lib/dados';
import { CadastroSheetSelector } from './components/cadastro-sheet-selector';
import { CadastroCategoryFields } from './components/cadastro-category-fields';
import { CadastroFormFields } from './components/cadastro-form-fields';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';


interface CadastroClientPageProps {
  initialSheetData: SheetHierarchy;
  initialSheetNames: string[]; // Recebe a lista completa de nomes
}

// Página para cadastrar novas frases (Componente de Cliente)
export function CadastroClientPage({ initialSheetData, initialSheetNames }: CadastroClientPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('single');
  const { toast } = useToast();
  const { profile } = useProfile();
  const { auth: firebaseAuthInstance } = useAuth();
  
  // Single mode state
  const [quote, setQuote] = useState('');
  const [intro, setIntro] = useState('');
  const [conclusion, setConclusion] = useState('');
  const [description, setDescription] = useState('');
  const [music, setMusic] = useState('');
  const [author, setAuthor] = useState('@canaldefeitos');
  const [editId, setEditId] = useState<string | null>(null);
  const [editRowNumber, setEditRowNumber] = useState<string | null>(null);
  
  // Bulk mode state
  const [bulkQuotes, setBulkQuotes] = useState('');
  const [bulkDelimiter, setBulkDelimiter] = useState(';');
  
  const [isLoading, setIsLoading] = useState(false);

  const [sheetData, setSheetData] = useState<SheetHierarchy>(initialSheetData);
  const [sheetNames, setSheetNames] = useState<string[]>(initialSheetNames); // Estado para a lista de nomes
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [selectedMainCategory, setSelectedMainCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  
  const [newSheetNameInput, setNewSheetNameInput] = useState('');
  const [newMainCategoryInput, setNewMainCategoryInput] = useState('');
  const [newSubCategoryInput, setNewSubCategoryInput] = useState('');

  // Efeito para preencher o formulário se vierem parâmetros de edição na URL
  useEffect(() => {
    const editQuote = searchParams.get('quote');
    if (editQuote) {
      setQuote(editQuote);
      setIntro(searchParams.get('intro') || '');
      setConclusion(searchParams.get('conclusion') || '');
      setMusic(searchParams.get('music') || '');
      setAuthor(searchParams.get('author') || '@canaldefeitos');
      
      const sheet = searchParams.get('sheet');
      const cat = searchParams.get('cat');
      const subcat = searchParams.get('subcat');
      
      if (sheet) setSelectedSheet(sheet);
      if (cat) setSelectedMainCategory(cat);
      if (subcat) setSelectedSubCategory(subcat);
      
      const desc = searchParams.get('desc');
      if (desc) setDescription(desc);

      const quoteId = searchParams.get('id');
      const rowNum = searchParams.get('row');
      if (rowNum) setEditRowNumber(rowNum);

      if (quoteId) {
        setEditId(quoteId);
        toast({
          title: "Modo Edição",
          description: "Você está editando uma frase existente. Ao salvar, a frase original será atualizada.",
        });
      } else {
        toast({
          title: "Modo Cópia",
          description: "Os campos foram preenchidos. Ao salvar, uma nova entrada será criada.",
        });
      }
    }
  }, [searchParams, toast]);

  // Rastreamento da última frase adicionada para navegação direta ao card
  const [lastAddedQuote, setLastAddedQuote] = useState<{
    id?: string | number;
    fullId?: string;
    sheetName: string;
    category?: string;
    subCategory?: string;
    quote: string;
  } | null>(null);

  // Estado para o modal comemorativo de sucesso
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [successModalData, setSuccessModalData] = useState<{
    title: string;
    message: string;
    quotePreview?: string;
  }>({
    title: '',
    message: ''
  });

  const filteredSheetNames = useMemo(() => {
    return sheetNames.filter(name => !['#Dados', 'NVScriptsProperties', 'Modelo'].includes(name));
  }, [sheetNames]);

  const getFinalCategories = () => {
    const finalSheetName = selectedSheet === '__new__' ? newSheetNameInput.trim() : selectedSheet;
    let finalMainCategory = selectedMainCategory === '__new__' ? newMainCategoryInput.trim() : selectedMainCategory;
    let finalSubCategory = selectedSubCategory === '__new__' ? newSubCategoryInput.trim() : selectedSubCategory;
    
    if (finalMainCategory === '__none__') finalMainCategory = '';
    if (finalSubCategory === '__none__') finalSubCategory = '';

    return { finalSheetName, finalMainCategory, finalSubCategory };
  };

  useEffect(() => {
    const savedDesc = localStorage.getItem('inspire_default_description') || '';
    if (savedDesc) {
      setDescription(savedDesc);
    }
  }, []);

  useEffect(() => {
    const { finalMainCategory, finalSubCategory } = getFinalCategories();
    const tags = [];
    if (finalMainCategory && finalMainCategory !== '__none__') {
      const t = finalMainCategory.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
      if (t) tags.push(`#${t}`);
    }
    if (finalSubCategory && finalSubCategory !== '__none__') {
      const t = finalSubCategory.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
      if (t) tags.push(`#${t}`);
    }
    if (music.trim()) {
      const t = music.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
      if (t) tags.push(`#${t}`);
    }

    const tagString = tags.join(' ');
    let base = localStorage.getItem('inspire_default_description') || '';
    
    if (base.includes('{frase}')) {
      base = base.replace(/{frase}/g, quote);
    } else if (base.includes('{quote}')) {
      base = base.replace(/{quote}/g, quote);
    }

    if (tagString) {
      setDescription(base ? `${base}\n\n${tagString}` : tagString);
    } else if (base) {
      setDescription(base);
    }
  }, [selectedMainCategory, selectedSubCategory, newMainCategoryInput, newSubCategoryInput, music, quote]);

  const handleCopyDescription = () => {
    navigator.clipboard.writeText(description);
    toast({
      title: "Descrição copiada!",
      description: "O texto da descrição e hashtags foi copiado para a área de transferência."
    });
  };

  const handleCopyAll = () => {
    let text = '';
    if (intro) text += `${intro}\n\n`;
    text += `${quote}\n\n`;
    if (conclusion) text += `${conclusion}\n\n`;
    if (description) text += `${description}\n\n`;
    if (music) text += `Música: ${music}\n\n`;
    if (author) text += `Por: ${author}`;

    navigator.clipboard.writeText(text.trim());
    toast({
      title: "Copiado com sucesso!",
      description: "Todos os campos foram copiados para a área de transferência."
    });
  };
  
  useEffect(() => {
    // Se estiver no APK, buscamos os dados mais recentes das abas/categorias
    if (Capacitor.isNativePlatform()) {
      const loadFreshData = async () => {
        try {
          const response = await fetchWithBase('/api/sheets/data');
          if (response.ok) {
            const { sheetData, sheetNames } = await response.json();
            if (sheetData) setSheetData(sheetData);
            if (sheetNames) setSheetNames(sheetNames);
          }
        } catch (err) {
          console.error("Erro ao carregar abas no APK:", err);
        }
      };
      loadFreshData();
    }
  }, []);

  useEffect(() => {
    // Se a aba selecionada for removida (por ex, em uma atualização), reseta a seleção
    if (selectedSheet && !sheetNames.includes(selectedSheet)) {
        setSelectedSheet('');
        setSelectedMainCategory('');
        setSelectedSubCategory('');
    }
  }, [sheetNames, selectedSheet]);

  // Recupera a última frase adicionada da sessão para navegação rápida ao card
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('inspire_last_added_quote');
      if (stored) {
        setLastAddedQuote(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const handleGoToCard = (targetQuote?: typeof lastAddedQuote) => {
    const q = targetQuote || lastAddedQuote;
    if (!q) {
      toast({
        title: "Nenhuma frase cadastrada recentemente",
        description: "Redirecionando para a lista geral de frases.",
      });
      router.push('/frases');
      return;
    }

    const params = new URLSearchParams();
    if (q.sheetName) params.set('mainCategory', q.sheetName);
    if (q.category) params.set('subCategory', q.category);
    if (q.fullId) {
      params.set('highlight', String(q.fullId));
    } else if (q.id) {
      params.set('highlight', String(q.id));
    }
    if (q.quote) {
      params.set('q', q.quote.slice(0, 40));
    }

    router.push(`/frases?${params.toString()}`);
  };

  const invalidateCacheInBackground = async () => {
    try {
      await fetchWithBase('/api/invalidate-cache', { method: 'POST' });
    } catch (error) {
      console.error("Falha ao atualizar cache em segundo plano:", error);
    }
  };

  const handleAddQuote = async () => {
    const { finalSheetName, finalMainCategory, finalSubCategory } = getFinalCategories();
    
    if (!quote.trim() || !finalMainCategory || !finalSheetName) {
      toast({
        variant: 'destructive',
        title: 'Campos Obrigatórios',
        description: 'Por favor, preencha a frase e selecione ou crie uma aba e categoria.',
      });
      return;
    }
  
    setIsLoading(true);
  
    try {
      const endpoint = editId ? '/api/admin/update-quote' : '/api/sheets/addQuote';
      const body: any = {
        quote,
        intro,
        conclusion,
        description,
        music,
        author,
        category: finalMainCategory,
        subCategory: finalSubCategory,
        sheetName: finalSheetName,
      };

      if (editId) {
        body.quoteId = editId;
        if (editRowNumber) {
          body.rowNumber = editRowNumber;
        }
        const token = await firebaseAuthInstance?.currentUser?.getIdToken().catch(() => null);
        const headers: Record<string, string> = { 
          'Content-Type': 'application/json' 
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetchWithBase(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
        });

        if (response.ok) {
          toast({ title: 'Frase atualizada com sucesso!' });
          setSuccessModalData({
            title: '🎉 Frase Atualizada! ✨',
            message: 'A frase foi editada no banco de dados com sucesso! 🎯',
            quotePreview: quote.trim()
          });
          setSuccessDialogOpen(true);
          setEditId(null);
          setEditRowNumber(null);
          setQuote('');
          setIntro('');
          setConclusion('');
          setMusic('');
          invalidateCacheInBackground();
        } else {
          const result = await response.json();
          throw new Error(result.error || 'Erro ao atualizar frase.');
        }
      } else {
        const response = await fetchWithBase(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
    
        let result: any = (response as any).data;
        if (!result && typeof (response as any).json === 'function') {
          result = await response.json();
        }
    
        if (response.ok) {
          const savedQuotePreview = quote.trim();
          const addedQuote = {
            id: result?.quote?.id,
            fullId: result?.quote?.fullId || (result?.quote?.id ? `${finalSheetName}-${result.quote.id}` : undefined),
            sheetName: finalSheetName,
            category: finalMainCategory,
            subCategory: finalSubCategory,
            quote: savedQuotePreview
          };
          setLastAddedQuote(addedQuote);
          try {
            sessionStorage.setItem('inspire_last_added_quote', JSON.stringify(addedQuote));
          } catch {}

          setQuote('');
          setIntro('');
          setConclusion('');
          setMusic('');
          const defaultDesc = localStorage.getItem('inspire_default_description') || '';
          setDescription(defaultDesc);
          toast({
            title: '🎉 Frase Cadastrada!',
            description: 'Sua frase foi salva com sucesso e você pode continuar cadastrando.',
          });
          setSuccessModalData({
            title: '🎉 Frase Cadastrada com Sucesso! ✨🚀',
            message: 'Sua frase foi salva na planilha com sucesso! Você pode continuar cadastrando na mesma categoria.',
            quotePreview: savedQuotePreview
          });
          setSuccessDialogOpen(true);
          invalidateCacheInBackground();
        } else {
          throw new Error(result.details || result.error || 'Erro desconhecido ao salvar.');
        }
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao Salvar',
        description: error instanceof Error ? error.message : 'Não foi possível salvar a frase.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkAddQuote = async () => {
    const { finalSheetName, finalMainCategory, finalSubCategory } = getFinalCategories();
    
    if (!bulkQuotes.trim() || !finalMainCategory || !finalSheetName) {
      toast({
        variant: 'destructive',
        title: 'Campos Obrigatórios',
        description: 'Por favor, preencha as frases e selecione ou crie uma aba e categoria.',
      });
      return;
    }

    const lines = bulkQuotes.split('\n').filter(l => l.trim());
    const parsedQuotes = lines.map(line => {
        const parts = line.split(bulkDelimiter).map(p => p.trim());
        if (parts.length === 1) {
            return { quote: parts[0], intro: '', conclusion: '', author };
        } else if (parts.length === 2) {
            return { intro: parts[0], quote: parts[1], conclusion: '', author };
        } else {
            return { intro: parts[0], quote: parts[1], conclusion: parts.slice(2).join(` ${bulkDelimiter} `), author };
        }
    });

    setIsLoading(true);
  
    try {
      const response = await fetchWithBase('/api/sheets/bulkAddQuote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quotes: parsedQuotes,
          category: finalMainCategory,
          subCategory: finalSubCategory,
          sheetName: finalSheetName,
        }),
      });
  
      let result;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.indexOf('application/json') !== -1) {
        result = await response.json();
      } else {
        const textError = await response.text();
        throw new Error(`Erro do servidor (${response.status}): ${textError || 'Sem detalhes'}`);
      }
  
      if (response.ok) {
        const count = parsedQuotes.length;
        setBulkQuotes('');
        setSuccessModalData({
          title: '🎉 Frases Cadastradas com Sucesso! ✨🚀',
          message: `${count} frases foram salvas na planilha com sucesso e já estão disponíveis para uso! 🎯👏`
        });
        setSuccessDialogOpen(true);
        invalidateCacheInBackground();
      } else {
        throw new Error(result.details || result.error || 'Erro desconhecido ao salvar.');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao Salvar',
        description: error instanceof Error ? error.message : 'Não foi possível salvar as frases em massa.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const categoriesForSelectedSheet = useMemo(() => {
    if (!selectedSheet || !sheetData[selectedSheet]) {
      return {};
    }
    return sheetData[selectedSheet];
  }, [selectedSheet, sheetData]);

  // Coleta estritamente as Categorias 2 (subcategorias) de todas as abas da planilha (com desduplicação case-insensitive)
  const allExistingCategories = useMemo(() => {
    const map = new Map<string, string>();
    Object.values(sheetData).forEach(sheetObj => {
      if (sheetObj && typeof sheetObj === 'object') {
        Object.values(sheetObj).forEach(subs => {
          if (Array.isArray(subs)) {
            subs.forEach(s => {
              if (s && s.trim() && s.trim().toLowerCase() !== 'geral') {
                const trimmed = s.trim();
                const key = trimmed.toLowerCase();
                const existing = map.get(key);
                if (!existing) {
                  map.set(key, trimmed);
                } else if (trimmed[0] === trimmed[0].toUpperCase() && existing[0] !== existing[0].toUpperCase()) {
                  map.set(key, trimmed);
                }
              }
            });
          }
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  }, [sheetData]);
  
  return (
    <main className="min-h-screen overflow-y-auto scroll-smooth bg-background/50">
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-primary">
                {editId ? 'Editar Frase' : 'Adicionar Nova Frase'}
              </CardTitle>
              <CardDescription>
                {editId 
                  ? 'Modifique os detalhes abaixo para atualizar a frase na planilha.' 
                  : 'Preencha os detalhes abaixo para incluir novas frases na planilha.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <CadastroSheetSelector 
                    selectedSheet={selectedSheet}
                    onSheetChange={(value) => {
                        setSelectedSheet(value);
                        setSelectedMainCategory('');
                        setSelectedSubCategory('');
                        if(value !== '__new__') setNewSheetNameInput('');
                    }}
                    filteredSheetNames={filteredSheetNames}
                    newSheetNameInput={newSheetNameInput}
                    onNewSheetNameChange={setNewSheetNameInput}
                />

                <CadastroCategoryFields 
                    selectedSheet={selectedSheet}
                    selectedMainCategory={selectedMainCategory}
                    onMainCategoryChange={(value) => {
                        setSelectedMainCategory(value);
                        if(value !== '__new__') setNewMainCategoryInput('');
                    }}
                    categoriesForSelectedSheet={categoriesForSelectedSheet}
                    allExistingCategories={allExistingCategories}
                    newMainCategoryInput={newMainCategoryInput}
                    onNewMainCategoryChange={setNewMainCategoryInput}
                    selectedSubCategory={selectedSubCategory}
                    onSubCategoryChange={(value) => {
                        setSelectedSubCategory(value);
                        if(value !== '__new__') setNewSubCategoryInput('');
                    }}
                    newSubCategoryInput={newSubCategoryInput}
                    onNewSubCategoryChange={setNewSubCategoryInput}
                />
              
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="single">Cadastro Individual</TabsTrigger>
                    <TabsTrigger value="bulk">Cadastro em Massa</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="single" className="space-y-6">
                    <CadastroFormFields 
                        quote={quote}
                        onQuoteChange={setQuote}
                        intro={intro}
                        onIntroChange={setIntro}
                        conclusion={conclusion}
                        onConclusionChange={setConclusion}
                        description={description}
                        onDescriptionChange={setDescription}
                        music={music}
                        onMusicChange={setMusic}
                        author={author}
                        onAuthorChange={setAuthor}
                        onCopyDescription={handleCopyDescription}
                    />
                    <div className={cn(
                        "grid gap-1.5 sm:gap-3",
                        editId ? "grid-cols-4" : "grid-cols-3"
                    )}>
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={handleCopyAll}
                            className="w-full bg-primary/10 hover:bg-primary/20 text-primary font-semibold border-primary/30 px-1.5 sm:px-3 text-xs sm:text-sm h-10 flex items-center justify-center gap-1 sm:gap-2"
                        >
                            <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                            <span className="truncate">Copiar Tudo</span>
                        </Button>
                        <Button 
                            onClick={handleAddQuote} 
                            disabled={isLoading} 
                            className={cn(
                                "w-full px-1.5 sm:px-3 text-xs sm:text-sm h-10 flex items-center justify-center gap-1 sm:gap-2",
                                editId && "bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                            )}
                        >
                            {isLoading ? (
                            <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin shrink-0" />
                            ) : (
                            <PlusCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                            )}
                            <span className="truncate">{isLoading ? 'Salvando...' : (editId ? 'Salvar Alterações' : 'Adicionar Frase')}</span>
                        </Button>
                        {editId && (
                            <Button 
                                type="button"
                                variant="destructive" 
                                onClick={() => {
                                    setEditId(null);
                                    setEditRowNumber(null);
                                    setQuote('');
                                    setIntro('');
                                    setConclusion('');
                                    setMusic('');
                                    toast({ title: "Edição cancelada" });
                                }}
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold px-1.5 sm:px-3 text-xs sm:text-sm h-10 flex items-center justify-center gap-1 sm:gap-2"
                            >
                                <span className="truncate">Cancelar</span>
                            </Button>
                        )}
                        <Button 
                            type="button"
                            variant="secondary"
                            onClick={() => handleGoToCard()}
                            className="w-full font-semibold border border-border px-1.5 sm:px-3 text-xs sm:text-sm h-10 flex items-center justify-center gap-1 sm:gap-2 hover:bg-secondary/80 text-foreground"
                            title={lastAddedQuote ? `Ir para o card da frase "${lastAddedQuote.quote.slice(0, 30)}..."` : "Ir para o card da última frase"}
                        >
                            <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                            <span className="truncate">Ir para o Card</span>
                        </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="bulk" className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Separador de Campos</Label>
                            <Select value={bulkDelimiter} onValueChange={setBulkDelimiter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o separador" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value=";">Ponto e Vírgula (;)</SelectItem>
                                    <SelectItem value="_">Underline (_)</SelectItem>
                                    <SelectItem value=",">Vírgula (,)</SelectItem>
                                    <SelectItem value="|">Barra Vertical (|)</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-sm text-muted-foreground">
                                Ex: Introdução ; Frase Principal ; Conclusão (apenas a frase principal é obrigatória)
                            </p>
                        </div>
                        
                        <div className="space-y-2">
                            <Label>Frases em Massa (uma por linha)</Label>
                            <Textarea 
                                value={bulkQuotes}
                                onChange={(e) => setBulkQuotes(e.target.value)}
                                placeholder="Cole suas frases aqui. Cada linha será um registro na planilha."
                                className="min-h-[200px]"
                            />
                        </div>
                    </div>
                    <Button onClick={handleBulkAddQuote} disabled={isLoading} className="w-full">
                        {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                        <PlusCircle className="mr-2 h-4 w-4" />
                        )}
                        {isLoading ? 'Salvando...' : 'Adicionar Frases em Massa'}
                    </Button>
                  </TabsContent>
                </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal estimulante de sucesso */}
      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent className="sm:max-w-md text-center p-6 space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-3xl shadow-inner animate-in zoom-in-50 duration-300">
            🎉
          </div>
          <DialogHeader className="space-y-2 text-center sm:text-center">
            <DialogTitle className="text-xl font-bold text-foreground text-center">
              {successModalData.title}
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base text-muted-foreground text-center pt-1">
              {successModalData.message}
            </DialogDescription>
          </DialogHeader>

          {successModalData.quotePreview && (
            <div className="p-3.5 bg-muted/60 border rounded-lg text-sm italic text-foreground/90 max-h-32 overflow-y-auto text-center border-dashed">
              &ldquo;{successModalData.quotePreview}&rdquo;
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-center pt-2">
            <Button 
              type="button"
              onClick={() => setSuccessDialogOpen(false)} 
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md"
            >
              Continuar Cadastrando ✨
            </Button>
            <Button 
              type="button"
              variant="outline"
              onClick={() => {
                setSuccessDialogOpen(false);
                handleGoToCard();
              }} 
              className="w-full sm:w-auto font-medium flex items-center justify-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Ver no Card de Frases
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

