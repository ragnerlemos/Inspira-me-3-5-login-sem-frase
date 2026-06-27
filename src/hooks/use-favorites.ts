
"use client";

import { useState, useEffect, useCallback } from "react";

const FAVORITES_KEY = "quotevid_favorites";

// Hook para gerenciar as frases favoritas usando o localStorage.
export const useFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>([]); // Alterado para string[] para IDs compostos

  // Carrega os favoritos do localStorage quando o componente é montado.
  // Garante que isso só rode no cliente, onde o localStorage está disponível.
  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem(FAVORITES_KEY);
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error("Failed to parse favorites from localStorage", error);
      setFavorites([]);
    }
  }, []);

  // Salva os favoritos no localStorage sempre que a lista de favoritos mudar.
  const saveFavorites = useCallback((items: string[]) => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(items));
    } catch (error) {
        console.error("Failed to save favorites to localStorage", error);
    }
  }, []);

  // Adiciona uma frase aos favoritos.
  const addFavorite = useCallback((id: string) => {
    setFavorites((prevFavorites) => {
        const newFavorites = [...prevFavorites, id];
        saveFavorites(newFavorites);
        return newFavorites;
    });
  }, [saveFavorites]);

  // Remove uma frase dos favoritos.
  const removeFavorite = useCallback((id: string) => {
    setFavorites((prevFavorites) => {
        const newFavorites = prevFavorites.filter((favId) => favId !== id);
        saveFavorites(newFavorites);
        return newFavorites;
    });
  }, [saveFavorites]);
  
  // Alterna o estado de favorito de uma frase (adiciona se não existir, remove se existir).
  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prevFavorites) => {
        let newFavorites;
        if(prevFavorites.includes(id)) {
            newFavorites = prevFavorites.filter((favId) => favId !== id);
        } else {
            newFavorites = [...prevFavorites, id];
        }
        saveFavorites(newFavorites);
        return newFavorites;
    });
  }, [saveFavorites]);


  return { favorites, addFavorite, removeFavorite, toggleFavorite };
};
