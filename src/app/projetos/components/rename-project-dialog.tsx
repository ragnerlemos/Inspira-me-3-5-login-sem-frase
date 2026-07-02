"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface RenameProjectDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    project: { id: string; name: string };
    onRename: (newName: string) => void;
}

export function RenameProjectDialog({ open, onOpenChange, project, onRename }: RenameProjectDialogProps) {
    const [newName, setNewName] = useState(project.name);
    
    useEffect(() => {
        setNewName(project.name);
    }, [project.name]);

    const handleRename = () => {
        if (newName.trim()) {
            onRename(newName.trim());
            onOpenChange(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Renomear Projeto</AlertDialogTitle>
                    <AlertDialogDescription>
                        Digite o novo nome para o projeto "{project.name}".
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-2">
                    <Label htmlFor="project-new-name" className="sr-only">Novo Nome</Label>
                    <Input 
                        id="project-new-name" 
                        value={newName} 
                        onChange={(e) => setNewName(e.target.value)} 
                        placeholder="Novo nome..." 
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                    />
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRename}>Salvar</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
