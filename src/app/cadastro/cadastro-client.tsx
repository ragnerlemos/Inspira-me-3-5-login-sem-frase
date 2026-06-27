
'use client';

import { useState, useMemo, useEffect, FormEvent } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2, Edit } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { fetchWithBase } from '@/lib/api-client';
import { Capacitor } from '@capacitor/core';
import type { SheetHierarchy } from '@/lib/dados';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


interface CadastroClientPageProps {
  initialSheetData: SheetHierarchy;
  initialSheetNames: string[]; // Recebe a lista completa de nomes
}

// Página para cadastrar novas frases (Componente de Cliente)
export function CadastroClientPage({ initialSheetData, initialSheetNames }: CadastroClientPageProps) {
  const [quote, setQuote] = useState('');
  const [author, setAuthor] = useState('@canaldefeitos');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [sheetData, setSheetData] = useState<SheetHierarchy>(initialSheetData);
  const [sheetNames, setSheetNames] = useState<string[]>(initialSheetNames); // Estado para a lista de nomes
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [selectedMainCategory, setSelectedMainCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  
  const filteredSheetNames = useMemo(() => {
    return sheetNames.filter(name => !['#Dados', 'NVScriptsProperties', 'Modelo'].includes(name));
  }, [sheetNames]);

  const [newSheetNameInput, setNewSheetNameInput] = useState('');
  const [newMainCategoryInput, setNewMainCategoryInput] = useState('');
  const [newSubCategoryInput, setNewSubCategoryInput] = useState('');
  
  const [isRenameSheetDialogOpen, setIsRenameSheetDialogOpen] = useState(false);
  const [renameSheetInput, setRenameSheetInput] = useState('');
  const [isRenamingSheet, setIsRenamingSheet] = useState(false);

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

  const invalidateCacheAndReload = async () => {
    try {
        setIsLoading(true);
        toast({ title: 'Atualizando...', description: 'Buscando os dados mais recentes da sua planilha.' });
        await fetchWithBase('/api/invalidate-cache', { method: 'POST' });
    } catch (error) {
        console.error("Falha ao tentar invalidar o cache:", error);
    } finally {
        window.location.reload();
    }
  };

  const handleAddQuote = async () => {
    const finalSheetName = selectedSheet === '__new__' ? newSheetNameInput.trim() : selectedSheet;
    let finalMainCategory = selectedMainCategory === '__new__' ? newMainCategoryInput.trim() : selectedMainCategory;
    let finalSubCategory = selectedSubCategory === '__new__' ? newSubCategoryInput.trim() : selectedSubCategory;
    
    if (finalMainCategory === '__none__') {
        finalMainCategory = '';
    }

    if (finalSubCategory === '__none__') {
      finalSubCategory = '';
    }

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
      const response = await fetchWithBase('/api/sheets/addQuote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quote,
          author,
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
        toast({
          title: 'Frase Adicionada!',
          description: 'Sua nova frase foi salva com sucesso. A página será atualizada.',
        });
        await invalidateCacheAndReload();
      } else {
        throw new Error(result.details || result.error || 'Erro desconhecido ao salvar.');
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

  const handleRenameSheet = async (event?: FormEvent) => {
    if (event) event.preventDefault();
    if (!selectedSheet || !renameSheetInput.trim() || selectedSheet === renameSheetInput.trim()) {
        setIsRenameSheetDialogOpen(false);
        return;
    };
    
    const oldSheetName = selectedSheet;
    const finalNewSheetName = renameSheetInput.trim();

    setIsRenamingSheet(true);
    try {
        const response = await fetchWithBase('/api/sheets/renameSheet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                oldSheetName: oldSheetName,
                newSheetName: finalNewSheetName,
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
            toast({
                title: "Aba Renomeada!",
                description: `A aba foi renomeada para "${finalNewSheetName}".`,
            });
            setSheetNames(prev => prev.map(name => name === oldSheetName ? finalNewSheetName : name));
            setSheetData(prev => {
                const newData = { ...prev };
                if (newData[oldSheetName]) {
                    newData[finalNewSheetName] = newData[oldSheetName];
                    delete newData[oldSheetName];
                }
                return newData;
            });
            setSelectedSheet(finalNewSheetName);
            fetch('/api/invalidate-cache', { method: 'POST' });
        } else {
            throw new Error(result.details || result.error || "Erro desconhecido");
        }
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Erro ao Renomear Aba",
            description: error instanceof Error ? error.message : "Ocorreu um problema ao renomear a aba.",
        });
    } finally {
        setIsRenamingSheet(false);
        setIsRenameSheetDialogOpen(false);
    }
  };

  const categoriesForSelectedSheet = useMemo(() => {
    if (!selectedSheet || !sheetData[selectedSheet]) {
      return {};
    }
    return sheetData[selectedSheet];
  }, [selectedSheet, sheetData]);
  
  return (
    <main className="min-h-screen overflow-y-auto scroll-smooth bg-background/50">
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-primary">Adicionar Nova Frase</CardTitle>
              <CardDescription>
                Preencha os detalhes abaixo para incluir uma nova frase.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="sheet-select" className="text-primary">Aba da Planilha</Label>
                    <div className="flex items-center gap-2">
                        <Select value={selectedSheet} onValueChange={(value) => {
                          setSelectedSheet(value);
                          setSelectedMainCategory('');
                          setSelectedSubCategory('');
                          if(value !== '__new__') setNewSheetNameInput('');
                        }}>
                            <SelectTrigger id="sheet-select" className="flex-1">
                                <SelectValue placeholder="Selecione ou crie uma aba..." />
                            </SelectTrigger>
                            <SelectContent>
                                {filteredSheetNames.map(sheetName => (
                                    <SelectItem key={sheetName} value={sheetName}>{sheetName}</SelectItem>
                                ))}
                                <SelectItem value="__new__">
                                    <span className='flex items-center'><PlusCircle className="mr-2 h-4 w-4" />Criar nova aba...</span>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     {selectedSheet === '__new__' && (
                        <Input 
                            value={newSheetNameInput}
                            onChange={(e) => setNewSheetNameInput(e.target.value)}
                            placeholder="Nome da nova aba"
                            className="mt-2"
                        />
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Categoria */}
                    <div className="space-y-2">
                        <Label htmlFor="category-name" className="text-primary text-sm font-medium">Categoria</Label>
                        {selectedSheet && selectedSheet !== '__new__' ? (
                        <>
                            <Select value={selectedMainCategory} onValueChange={(value) => {
                            setSelectedMainCategory(value);
                            setSelectedSubCategory('');
                            if(value !== '__new__') setNewMainCategoryInput('');
                            }}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecione ou crie..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__none__">Nenhuma</SelectItem>
                                <SelectItem value="__new__">
                                    <span className='flex items-center text-primary font-medium'><PlusCircle className="mr-2 h-4 w-4" />Criar nova categoria...</span>
                                </SelectItem>
                                {Object.keys(categoriesForSelectedSheet).sort().map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                            </SelectContent>
                            </Select>

                            {selectedMainCategory === '__new__' && (
                            <div className="pt-2 animate-in fade-in slide-in-from-top-2">
                                <Input autoFocus value={newMainCategoryInput} onChange={e => setNewMainCategoryInput(e.target.value)} placeholder="Nome da nova categoria..." className="border-primary/50 focus-visible:ring-primary" />
                            </div>
                            )}
                        </>
                        ) : (
                        <div className="h-10 flex items-center px-3 border rounded-md bg-muted/50 text-sm text-muted-foreground">
                            Aba pendente
                        </div>
                        )}
                    </div>

                    {/* Subcategoria */}
                    <div className="space-y-2">
                        <Label htmlFor="sub-category-name" className="text-primary text-sm font-medium">Subcategoria (Opcional)</Label>
                        {selectedSheet && selectedSheet !== '__new__' ? (
                        <>
                            {selectedMainCategory === '__new__' ? (
                                <div className="animate-in fade-in slide-in-from-top-2">
                                    <Input value={newSubCategoryInput} onChange={e => setNewSubCategoryInput(e.target.value)} placeholder="Nome da nova subcategoria..." className="border-primary/50 focus-visible:ring-primary h-10" />
                                </div>
                            ) : (
                                <>
                                    <Select disabled={!selectedMainCategory || selectedMainCategory === '__none__'} value={selectedSubCategory} onValueChange={(value) => {
                                        setSelectedSubCategory(value);
                                        if(value !== '__new__') setNewSubCategoryInput('');
                                    }}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder={!selectedMainCategory || selectedMainCategory === '__none__' ? "Selecione uma categoria primeiro" : "Selecione ou crie..."} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="__none__">Nenhuma</SelectItem>
                                            <SelectItem value="__new__">
                                                <span className='flex items-center text-primary font-medium'><PlusCircle className="mr-2 h-4 w-4" />Criar nova subcategoria...</span>
                                            </SelectItem>
                                            {selectedMainCategory && selectedMainCategory !== '__none__' && categoriesForSelectedSheet[selectedMainCategory]?.map(sub => (
                                            <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {selectedSubCategory === '__new__' && (
                                        <div className="pt-2 animate-in fade-in slide-in-from-top-2">
                                            <Input autoFocus value={newSubCategoryInput} onChange={e => setNewSubCategoryInput(e.target.value)} placeholder="Nome da nova subcategoria..." className="border-primary/50 focus-visible:ring-primary" />
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                        ) : (
                        <div className="h-10 flex items-center px-3 border rounded-md bg-muted/50 text-sm text-muted-foreground">
                            Aba pendente
                        </div>
                        )}
                    </div>
                </div>
              
              <div className="space-y-2">
                <Label htmlFor="quote-text" className="text-primary">Frase</Label>
                <Textarea
                  id="quote-text"
                  placeholder="Digite a frase aqui..."
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="author-name" className="text-primary">Autor</Label>
                <Input
                  id="author-name"
                  placeholder="Ex: Albert Einstein"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                />
              </div>
              <Button onClick={handleAddQuote} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <PlusCircle className="mr-2 h-4 w-4" />
                )}
                {isLoading ? 'Salvando...' : 'Adicionar Frase'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
