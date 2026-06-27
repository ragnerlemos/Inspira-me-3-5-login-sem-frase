
"use client";

import { useState, useEffect, useCallback } from "react";
import { nanoid } from 'nanoid';
import type { EditorState } from "@/app/editor-de-video/tipos";

const PROJECTS_KEY = "quotevid_my_projects";

// Define o tipo para um projeto salvo
export interface SavedProject {
  id: string;
  name: string;
  thumbnail: string;
  editorState: EditorState;
  createdAt: string; // Data no formato ISO
  updatedAt: string; // Data no formato ISO
}

// Hook para gerenciar os projetos salvos usando o localStorage.
export const useProjects = () => {
  const [projects, setProjects] = useState<SavedProject[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const storedProjects = localStorage.getItem(PROJECTS_KEY);
        if (storedProjects) {
          return JSON.parse(storedProjects);
        }
      } catch (error) {
        console.error("Failed to parse saved projects from localStorage", error);
      }
    }
    return [];
  });
  const [isLoaded, setIsLoaded] = useState(() => {
    return typeof window !== "undefined";
  });

  // Salva a lista de projetos no localStorage.
  const saveProjects = useCallback((projectsToSave: SavedProject[]) => {
    try {
      // Ordena por data de atualização antes de salvar
      const sortedProjects = projectsToSave.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(sortedProjects));
    } catch (error) {
        console.error("Failed to save projects to localStorage", error);
    }
  }, []);

  // Adiciona um novo projeto à lista.
  const addProject = useCallback((project: Omit<SavedProject, 'id' | 'createdAt' | 'updatedAt'>): string => {
    const newId = nanoid();
    const now = new Date().toISOString();
    const newProject: SavedProject = { 
        ...project, 
        id: newId, 
        createdAt: now, 
        updatedAt: now 
    };

    setProjects((prevProjects) => {
        const newProjects = [newProject, ...prevProjects];
        saveProjects(newProjects);
        return newProjects;
    });
    return newId;
  }, [saveProjects]);

  // Atualiza um projeto existente.
  const updateProject = useCallback((id: string, updatedState: EditorState, thumbnail: string) => {
      setProjects(prevProjects => {
          const now = new Date().toISOString();
          const newProjects = prevProjects.map(p => 
              p.id === id 
              ? { ...p, editorState: updatedState, thumbnail, updatedAt: now } 
              : p
          );
          saveProjects(newProjects);
          return newProjects;
      });
  }, [saveProjects]);
  
  // Renomeia um projeto existente.
  const renameProject = useCallback((id: string, newName: string) => {
    setProjects(prevProjects => {
        const now = new Date().toISOString();
        const newProjects = prevProjects.map(p => 
            p.id === id 
            ? { ...p, name: newName, updatedAt: now } 
            : p
        );
        saveProjects(newProjects);
        return newProjects;
    });
  }, [saveProjects]);

  // Remove um projeto da lista.
  const removeProject = useCallback((id: string) => {
    setProjects((prevProjects) => {
        const newProjects = prevProjects.filter((project) => project.id !== id);
        saveProjects(newProjects);
        return newProjects;
    });
  }, [saveProjects]);

  return { projects, addProject, updateProject, renameProject, removeProject, isLoaded };
};
