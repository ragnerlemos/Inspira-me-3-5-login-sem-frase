'use client';

import { useState, useCallback } from 'react';
import { useGoogleSheets } from './google-sheets-provider';
import { useToast } from '@/hooks/use-toast';

interface QuoteWithAuthor {
    id: string;
    quote: string;
    author?: string;
    category: string;
    subCategory?: string;
    sheetName: string;
}

export function useSheetQuotes() {
  const { accessToken, spreadsheetId, sheetName, isConnected } = useGoogleSheets();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchQuotes = useCallback(async () => {
    if (!isConnected || !spreadsheetId || !sheetName) return null;

    setIsLoading(true);
    try {
      // Fetch values from the selected range (A:J)
      const range = `${sheetName}!A:J`;
      const res = await fetch(`/api/google/sheets/values?spreadsheetId=${spreadsheetId}&range=${encodeURIComponent(range)}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (!res.ok) {
        throw new Error('Falha ao buscar dados da planilha');
      }

      const rows: any[][] = await res.json();
      if (rows.length <= 1) {
          return [];
      }

      // Map rows to quotes
      // Assuming structure based on src/lib/dados.ts:
      // col 0: ID
      // col 3: Category
      // col 2: SubCategory
      // col 5: Quote text
      // col 9: Author
      
      const quotes: QuoteWithAuthor[] = rows.slice(1).map((row, index) => {
        const quoteText = row[5];
        if (!quoteText) return null;

        return {
          id: row[0]?.toString() || `sheet-${index}`,
          quote: quoteText,
          author: row[9] || undefined,
          category: row[3] || 'Geral',
          subCategory: row[2] || undefined,
          sheetName: sheetName
        };
      }).filter((q): q is QuoteWithAuthor => q !== null);

      return quotes;
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erro ao importar frases",
        description: "Não foi possível ler os dados da sua planilha Google.",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, spreadsheetId, sheetName, isConnected, toast]);

  return { fetchQuotes, isLoading };
}
