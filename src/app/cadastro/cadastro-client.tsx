
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';
import { fetchWithBase } from '@/lib/api-client';
import { Capacitor } from '@capacitor/core';
import type { SheetHierarchy } from '@/lib/dados';
import { CadastroSheetSelector } from './components/cadastro-sheet-selector';
import { CadastroCategoryFields } from './components/cadastro-category-fields';
import { CadastroFormFields } from './components/cadastro-form-fields';


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
                        setSelectedSubCategory('');
                        if(value !== '__new__') setNewMainCategoryInput('');
                    }}
                    categoriesForSelectedSheet={categoriesForSelectedSheet}
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
              
                <CadastroFormFields 
                    quote={quote}
                    onQuoteChange={setQuote}
                    author={author}
                    onAuthorChange={setAuthor}
                />

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

