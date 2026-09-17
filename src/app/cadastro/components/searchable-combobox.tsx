"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Check, ChevronsUpDown, PlusCircle, Search, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { cn } from "@/lib/utils";

export interface SearchableGroup {
  label: string;
  options: string[];
}

export interface SearchableComboboxProps {
  value: string;
  onValueChange: (val: string) => void;
  options?: string[];
  groups?: SearchableGroup[];
  placeholder?: string;
  searchPlaceholder?: string;
  allowNone?: boolean;
  noneLabel?: string;
  allowCreate?: boolean;
  createLabel?: string;
  disabled?: boolean;
  className?: string;
}

// Normaliza texto removendo acentos e convertendo para minúsculas
function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

// Verifica se uma string é subsequência de outra (ex: 'vf' em 'vou ficar', 'vorcar' em 'vou ficar')
function isSubsequence(sub: string, full: string): boolean {
  let subIdx = 0;
  for (let i = 0; i < full.length && subIdx < sub.length; i++) {
    if (full[i] === sub[subIdx]) {
      subIdx++;
    }
  }
  return subIdx === sub.length;
}

// Distância de Levenshtein para tolerar pequenos erros de digitação (ex: vorcar -> vou ficar)
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substituição
          matrix[i][j - 1] + 1,     // inserção
          matrix[i - 1][j] + 1      // deleção
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

// Calcula relevância da busca (número maior = mais relevante)
function scoreMatch(item: string, query: string): number {
  if (!query) return 100;
  const nItem = normalize(item);
  const nQuery = normalize(query);

  if (nItem === nQuery) return 1000;
  if (nItem.startsWith(nQuery)) return 500;

  // Iniciais de cada palavra (ex: "bf" ou "vf" para "Vou Ficar")
  const words = nItem.split(/[\s\-_/]+/);
  const initials = words.map(w => w[0]).join("");
  if (initials.startsWith(nQuery) || initials.includes(nQuery)) return 400;

  // Se alguma palavra começa com o termo digitado
  const anyWordStarts = words.some(w => w.startsWith(nQuery));
  if (anyWordStarts) return 300;

  // Se contém a substring em qualquer parte
  if (nItem.includes(nQuery)) return 200;

  // Se é subsequência dos caracteres
  if (isSubsequence(nQuery, nItem)) return 100;

  // Erro leve de digitação (Levenshtein) comparado com o item ou palavras
  if (nQuery.length >= 3) {
    const distFull = levenshteinDistance(nQuery, nItem);
    if (distFull <= 2) return 80 - distFull * 10;

    for (const w of words) {
      if (w.length >= 3 && levenshteinDistance(nQuery, w) <= 2) {
        return 70;
      }
    }
  }

  return 0;
}

export function SearchableCombobox({
  value,
  onValueChange,
  options = [],
  groups,
  placeholder = "Selecione ou pesquise...",
  searchPlaceholder = "Digite para filtrar...",
  allowNone = true,
  noneLabel = "Nenhuma",
  allowCreate = true,
  createLabel = "Criar nova categoria...",
  disabled = false,
  className,
}: SearchableComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Foco automático no input quando o popover abrir
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(t);
    } else {
      setQuery("");
    }
  }, [open]);

  // Filtra e classifica lista simples
  const filteredOptions = useMemo(() => {
    if (!options || options.length === 0) return [];
    if (!query.trim()) return options;

    return options
      .map(opt => ({ opt, score: scoreMatch(opt, query) }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.opt);
  }, [options, query]);

  // Filtra grupos se fornecidos
  const filteredGroups = useMemo(() => {
    if (!groups || groups.length === 0) return [];
    if (!query.trim()) return groups;

    return groups
      .map(group => {
        const filtered = group.options
          .map(opt => ({ opt, score: scoreMatch(opt, query) }))
          .filter(item => item.score > 0)
          .sort((a, b) => b.score - a.score)
          .map(item => item.opt);
        return {
          label: group.label,
          options: filtered,
        };
      })
      .filter(g => g.options.length > 0);
  }, [groups, query]);

  const totalResults = groups
    ? filteredGroups.reduce((acc, g) => acc + g.options.length, 0)
    : filteredOptions.length;

  // Rótulo amigável exibido no botão
  const displayLabel = useMemo(() => {
    if (value === "__none__" || !value) return noneLabel;
    if (value === "__new__") return "Criar nova...";
    return value;
  }, [value, noneLabel]);

  const isSelected = (val: string) => value === val;

  const handleSelect = (val: string) => {
    onValueChange(val);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal text-left h-10 px-3 bg-background hover:bg-accent/50 border-input",
            !value || value === "__none__" ? "text-muted-foreground" : "text-foreground font-medium",
            className
          )}
        >
          <span className="truncate">{displayLabel}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] min-w-[280px] p-0 shadow-lg border-border bg-popover"
      >
        {/* Campo de Busca em Tempo Real */}
        <div className="flex items-center border-b px-3 py-2 gap-2 bg-muted/20">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-8 border-none bg-transparent p-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-muted-foreground hover:text-foreground rounded p-0.5"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="max-h-64 overflow-y-auto p-1 custom-scrollbar">
          {/* Opção Nenhuma */}
          {allowNone && (
            <div
              onClick={() => handleSelect("__none__")}
              className={cn(
                "relative flex cursor-pointer select-none items-center rounded-sm px-2.5 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
                isSelected("__none__") && "bg-accent/60 font-medium"
              )}
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4 text-primary",
                  isSelected("__none__") ? "opacity-100" : "opacity-0"
                )}
              />
              <span className="text-muted-foreground italic">{noneLabel}</span>
            </div>
          )}

          {/* Opção Criar Nova */}
          {allowCreate && (
            <div
              onClick={() => handleSelect("__new__")}
              className={cn(
                "relative flex cursor-pointer select-none items-center rounded-sm px-2.5 py-1.5 text-sm outline-none transition-colors text-primary hover:bg-primary/10 hover:text-primary font-medium",
                isSelected("__new__") && "bg-primary/15 font-semibold"
              )}
            >
              <PlusCircle className="mr-2 h-4 w-4 shrink-0 text-primary" />
              <span className="truncate">
                {query.trim() ? `Criar "${query.trim()}"...` : createLabel}
              </span>
            </div>
          )}

          {/* Divisor */}
          {(allowNone || allowCreate) && (
            <div className="my-1 border-t border-border/50" />
          )}

          {/* Lista com Grupos */}
          {groups && groups.length > 0 ? (
            filteredGroups.length === 0 ? (
              <div className="py-4 text-center text-xs text-muted-foreground">
                Nenhuma categoria encontrada para &ldquo;{query}&rdquo;
              </div>
            ) : (
              filteredGroups.map((group, idx) => (
                <div key={`group-${idx}`} className="mb-2">
                  <div className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80 bg-muted/40 rounded-sm mb-1">
                    {group.label}
                  </div>
                  {group.options.map((opt) => (
                    <div
                      key={`opt-${group.label}-${opt}`}
                      onClick={() => handleSelect(opt)}
                      className={cn(
                        "relative flex cursor-pointer select-none items-center rounded-sm px-2.5 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
                        isSelected(opt) && "bg-accent/60 font-medium"
                      )}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4 text-primary",
                          isSelected(opt) ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span className="truncate">{opt}</span>
                    </div>
                  ))}
                </div>
              ))
            )
          ) : (
            /* Lista Simples */
            filteredOptions.length === 0 ? (
              <div className="py-4 text-center text-xs text-muted-foreground">
                Nenhuma categoria encontrada para &ldquo;{query}&rdquo;
              </div>
            ) : (
              filteredOptions.map((opt) => (
                <div
                  key={`opt-${opt}`}
                  onClick={() => handleSelect(opt)}
                  className={cn(
                    "relative flex cursor-pointer select-none items-center rounded-sm px-2.5 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
                    isSelected(opt) && "bg-accent/60 font-medium"
                  )}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 text-primary",
                      isSelected(opt) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="truncate">{opt}</span>
                </div>
              ))
            )
          )}
        </div>
        {totalResults > 0 && query.trim() && (
          <div className="border-t border-border/40 px-2.5 py-1 text-[11px] text-muted-foreground/70 bg-muted/10 text-right">
            {totalResults} {totalResults === 1 ? "resultado" : "resultados"}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
