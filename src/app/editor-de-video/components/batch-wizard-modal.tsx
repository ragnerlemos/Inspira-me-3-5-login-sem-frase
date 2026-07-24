"use client";

// test comment

import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Quote {
  id: string;
  texto: string;
  categoria: string;
  subcategoria?: string;
  autor?: string;
  // Raw fields from Google Sheets API
  quote: string;
  category?: string;
  subCategory?: string;
  sheetName?: string;
}

interface BatchWizardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateBatch: (quotes: string[], category: string, subCategory: string) => void;
}

export function BatchWizardModal({ open, onOpenChange, onCreateBatch }: BatchWizardModalProps) {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [categoriesMap, setCategoriesMap] = useState<{ [aba: string]: { [cat1: string]: string[] } }>({});
  
  const [selectedAba, setSelectedAba] = useState<string>("all");
  const [selectedCategoria1, setSelectedCategoria1] = useState<string>("all");
  const [selectedCategoria2, setSelectedCategoria2] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selectedQuotes, setSelectedQuotes] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const quotesRes = await fetch('/api/quotes');
        if (!quotesRes.ok) throw new Error("Failed to load");
        
        const quotesData = await quotesRes.json();

        // Map quotes correctly to match local Quote interface and preserve original fields
        const mappedQuotes: Quote[] = quotesData.map((q: any) => ({
          id: q.id,
          texto: q.quote || "",
          categoria: q.category || q.sheetName || "",
          subcategoria: q.subCategory || "",
          autor: q.author || "",
          quote: q.quote || "",
          category: q.category || "",
          subCategory: q.subCategory || "",
          sheetName: q.sheetName || ""
        }));
        setQuotes(mappedQuotes);
        
        // Build 3-level hierarchy: Aba -> Cat1 -> [Cat2]
        const hierarchy: { [aba: string]: { [cat1: string]: Set<string> } } = {};
        
        mappedQuotes.forEach(q => {
          const aba = q.sheetName || "Geral";
          const cat1 = q.category || "Sem Categoria";
          const cat2 = q.subCategory || "Sem Subcategoria";
          
          if (!hierarchy[aba]) hierarchy[aba] = {};
          if (!hierarchy[aba][cat1]) hierarchy[aba][cat1] = new Set();
          if (cat2) {
            hierarchy[aba][cat1].add(cat2);
          }
        });

        const hierarchyArrays: { [aba: string]: { [cat1: string]: string[] } } = {};
        for (const aba in hierarchy) {
          hierarchyArrays[aba] = {};
          for (const cat1 in hierarchy[aba]) {
            hierarchyArrays[aba][cat1] = Array.from(hierarchy[aba][cat1]);
          }
        }

        setCategoriesMap(hierarchyArrays);
        setSelectedAba("all");
        setSelectedCategoria1("all");
        setSelectedCategoria2("all");
      } catch (e) {
        toast({ title: "Erro", description: "Não foi possível carregar as frases.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      loadData();
    }
  }, [open, toast]);

  const abaCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    quotes.forEach(q => {
      const aba = q.sheetName || "Geral";
      counts[aba] = (counts[aba] || 0) + 1;
    });
    return counts;
  }, [quotes]);

  const cat1Counts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    quotes
      .filter(q => selectedAba === "all" || (q.sheetName || "Geral") === selectedAba)
      .forEach(q => {
        const cat1 = q.category || "Sem Categoria";
        counts[cat1] = (counts[cat1] || 0) + 1;
      });
    return counts;
  }, [quotes, selectedAba]);

  const cat2Counts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    quotes
      .filter(q => 
        (selectedAba === "all" || (q.sheetName || "Geral") === selectedAba) &&
        (selectedCategoria1 === "all" || (q.category || "Sem Categoria") === selectedCategoria1)
      )
      .forEach(q => {
        const cat2 = q.subCategory || "Sem Subcategoria";
        counts[cat2] = (counts[cat2] || 0) + 1;
      });
    return counts;
  }, [quotes, selectedAba, selectedCategoria1]);

  const availableAbas = useMemo(() => Object.keys(categoriesMap), [categoriesMap]);
  const availableCat1 = useMemo(() => {
    if (selectedAba === "all" || !categoriesMap[selectedAba]) return [];
    return Object.keys(categoriesMap[selectedAba]);
  }, [categoriesMap, selectedAba]);
  const availableCat2 = useMemo(() => {
    if (selectedAba === "all" || selectedCategoria1 === "all" || !categoriesMap[selectedAba] || !categoriesMap[selectedAba][selectedCategoria1]) return [];
    return categoriesMap[selectedAba][selectedCategoria1];
  }, [categoriesMap, selectedAba, selectedCategoria1]);

  const filteredQuotes = quotes.filter(q => {
    const aba = q.sheetName || "Geral";
    const cat1 = q.category || "Sem Categoria";
    const cat2 = q.subCategory || "Sem Subcategoria";

    const matchAba = selectedAba === "all" || aba === selectedAba;
    const matchCat1 = selectedCategoria1 === "all" || cat1 === selectedCategoria1;
    const matchCat2 = selectedCategoria2 === "all" || cat2 === selectedCategoria2;
    
    const matchSearch = !search || q.texto.toLowerCase().includes(search.toLowerCase());

    return matchAba && matchCat1 && matchCat2 && matchSearch;
  });

  const handleToggleQuote = (id: string) => {
    const next = new Set(selectedQuotes);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedQuotes(next);
  };

  const handleSelectAll = () => {
    const next = new Set(selectedQuotes);
    filteredQuotes.forEach(q => next.add(q.id));
    setSelectedQuotes(next);
  };

  const handleClear = () => {
    setSelectedQuotes(new Set());
  };

  const handleCreate = () => {
    if (selectedQuotes.size === 0) {
      toast({ title: "Atenção", description: "Selecione ao menos uma frase.", variant: "destructive" });
      return;
    }

    const selectedTexts = quotes
      .filter(q => selectedQuotes.has(q.id))
      .map(q => q.texto);

    onCreateBatch(
      selectedTexts,
      selectedAba !== "all" ? selectedAba : "Geral"
    );
    onOpenChange(false);
  };

  console.log("Render BatchWizardModal, categories:", categories, "open:", open);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Criar Projeto em Lote</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 overflow-hidden mt-4">
          <div className="flex flex-col gap-3">
             <div className="grid grid-cols-3 gap-3">
                <div>
                   <Label className="mb-2 block text-xs font-semibold">Categoria (Aba)</Label>
                   <Select value={selectedAba} onValueChange={(val) => {
                     setSelectedAba(val);
                     setSelectedCategoria1("all");
                     setSelectedCategoria2("all");
                   }}>
                     <SelectTrigger>
                       <SelectValue placeholder="Selecione uma aba" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="all">Todas ({quotes.length})</SelectItem>
                       {availableAbas.map(aba => (
                         <SelectItem key={aba} value={aba}>{aba} ({abaCounts[aba]})</SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                </div>
                <div>
                   <Label className="mb-2 block text-xs font-semibold">Categoria 1</Label>
                   <Select value={selectedCategoria1} onValueChange={(val) => {
                     setSelectedCategoria1(val);
                     setSelectedCategoria2("all");
                   }} disabled={selectedAba === "all" || availableCat1.length === 0}>
                     <SelectTrigger>
                       <SelectValue placeholder="Selecione Categoria 1" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="all">Todas ({quotes.filter(q => selectedAba === "all" || (q.sheetName || "Geral") === selectedAba).length})</SelectItem>
                       {availableCat1.map(cat1 => (
                         <SelectItem key={cat1} value={cat1}>{cat1} ({cat1Counts[cat1]})</SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                </div>
                <div>
                   <Label className="mb-2 block text-xs font-semibold">Categoria 2</Label>
                   <Select value={selectedCategoria2} onValueChange={(val) => {
                     setSelectedCategoria2(val);
                   }} disabled={selectedCategoria1 === "all" || availableCat2.length === 0}>
                     <SelectTrigger>
                       <SelectValue placeholder="Selecione Categoria 2" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="all">Todas ({quotes.filter(q => (selectedAba === "all" || (q.sheetName || "Geral") === selectedAba) && (selectedCategoria1 === "all" || (q.category || "Sem Categoria") === selectedCategoria1)).length})</SelectItem>
                       {availableCat2.map(cat2 => (
                         <SelectItem key={cat2} value={cat2}>{cat2} ({cat2Counts[cat2]})</SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                </div>
             </div>
             <div>
                <Label className="mb-2 block text-xs font-semibold">Buscar</Label>
                <Input placeholder="Buscar frase..." value={search} onChange={e => setSearch(e.target.value)} />
             </div>
          </div>

          <div className="flex justify-between items-center text-sm">
             <span>{selectedQuotes.size} frases selecionadas</span>
             <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleSelectAll}>Selecionar Visíveis</Button>
                <Button variant="ghost" size="sm" onClick={handleClear}>Limpar</Button>
             </div>
          </div>

          <div className="flex-1 border rounded-md overflow-hidden relative">
             {loading && <div className="absolute inset-0 bg-background/50 flex items-center justify-center">Carregando...</div>}
             <ScrollArea className="h-full">
                <div className="p-4 flex flex-col gap-2">
                   {filteredQuotes.map(quote => (
                     <div key={quote.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors" onClick={() => handleToggleQuote(quote.id)}>
                        <Checkbox checked={selectedQuotes.has(quote.id)} onCheckedChange={() => handleToggleQuote(quote.id)} className="mt-1" />
                        <div className="flex-1">
                           <p className="text-sm">{quote.texto}</p>
                           <p className="text-xs text-muted-foreground mt-1">
                             {quote.categoria} 
                             {quote.subcategoria ? ` - ${quote.subcategoria}` : ''}
                             {quote.sheetName && quote.sheetName !== quote.categoria ? ` (${quote.sheetName})` : ''}
                           </p>
                        </div>
                     </div>
                   ))}
                   {!loading && filteredQuotes.length === 0 && (
                     <p className="text-center text-muted-foreground py-8">Nenhuma frase encontrada.</p>
                   )}
                </div>
             </ScrollArea>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleCreate}>Criar {selectedQuotes.size} Páginas</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
