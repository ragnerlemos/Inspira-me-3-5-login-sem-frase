
"use client";

import { useState, useEffect, useCallback } from "react";

const HIDDEN_QUOTES_KEY = "quotevid_hidden_quotes";

export const useHiddenQuotes = () => {
  const [hiddenQuotes, setHiddenQuotes] = useState<string[]>([]);

  useEffect(() => {
    try {
      const storedHidden = localStorage.getItem(HIDDEN_QUOTES_KEY);
      if (storedHidden) {
        setHiddenQuotes(JSON.parse(storedHidden));
      }
    } catch (error) {
      console.error("Failed to parse hidden quotes from localStorage", error);
      setHiddenQuotes([]);
    }
  }, []);

  const hideQuote = useCallback((id: string) => {
    setHiddenQuotes((prev) => {
      if (prev.includes(id)) return prev;
      const newHidden = [...prev, id];
      localStorage.setItem(HIDDEN_QUOTES_KEY, JSON.stringify(newHidden));
      return newHidden;
    });
  }, []);

  const unhideQuote = useCallback((id: string) => {
    setHiddenQuotes((prev) => {
      const newHidden = prev.filter((quoteId) => quoteId !== id);
      localStorage.setItem(HIDDEN_QUOTES_KEY, JSON.stringify(newHidden));
      return newHidden;
    });
  }, []);

  return { hiddenQuotes, hideQuote, unhideQuote };
};
