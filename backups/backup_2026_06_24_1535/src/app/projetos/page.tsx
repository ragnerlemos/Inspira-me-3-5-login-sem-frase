
"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Clapperboard, PlusCircle, Edit, Trash2, MoreVertical } from "lucide-react";
import { useProjects } from "@/hooks/use-projects";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const dynamic = 'force-dynamic';
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";


function RenameProjectDialog({ open, onOpenChange, project, onRename }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    project: { id: string; name: string };
    onRename: (newName: string) => void;
}) {
    const [newName, setNewName] = useState(project.name);
    
    const handleRename = () => {
        onRename(newName);
        onOpenChange(false);
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
                    <Input id="project-new-name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Novo nome..." />
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRename}>Salvar</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

// Página para exibir os projetos salvos pelo usuário.
export default function MyProjectsPage() {
  const { projects, removeProject, renameProject, isLoaded } = useProjects();
  const { toast } = useToast();
  const [renameTarget, setRenameTarget] = useState<{ id: string; name: string } | null>(null);

  const handleRemove = (e: React.MouseEvent, id: string, name: string) => {
    e.preventDefault();
    e.stopPropagation();
    removeProject(id);
    toast({ title: "Projeto Excluído!", description: `O projeto "${name}" foi removido.` });
  };
  
  const handleRename = (newName: string) => {
    if (!renameTarget) return;
    renameProject(renameTarget.id, newName);
    toast({ title: "Projeto Renomeado!", description: "O nome do projeto foi atualizado."});
    setRenameTarget(null);
  };

  return (
    <>
        <main className="overflow-y-auto">
            <div className="container mx-auto py-8 px-4">
                <div className="text-center mb-8">
                    <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">Meus Projetos</h1>
                    <p className="text-muted-foreground mt-2 text-lg">Aqui estão seus vídeos e designs salvos.</p>
                </div>

                {isLoaded && projects.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                    {projects.map((project) => (
                    <Link key={project.id} href={`/editor-de-video?projectId=${project.id}`} passHref className="group">
                        <Card className="overflow-hidden flex flex-col h-full hover:shadow-lg transition-shadow">
                            <CardContent className="p-0 aspect-[9/16] relative bg-muted flex items-center justify-center">
                               <Image 
                                    src={project.thumbnail} 
                                    alt={project.name} 
                                    fill
                                    className="object-contain"
                               />
                            </CardContent>
                            <CardFooter className="p-2 flex justify-between items-center bg-card">
                                <div className="flex-1 overflow-hidden">
                                    <p className="font-semibold text-sm truncate">{project.name}</p>
                                    <p className="text-xs text-muted-foreground">{new Date(project.updatedAt).toLocaleDateString()}</p>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 opacity-50 group-hover:opacity-100 flex-shrink-0"
                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                        >
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                                        <DropdownMenuItem onClick={() => setRenameTarget({id: project.id, name: project.name})}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Renomear
                                        </DropdownMenuItem>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <button className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full text-destructive">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Excluir
                                                </button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Esta ação não pode ser desfeita. Isso excluirá permanentemente o projeto "{project.name}".
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction onClick={(e) => handleRemove(e, project.id, project.name)}>Excluir</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </CardFooter>
                        </Card>
                    </Link>
                    ))}
                </div>
                ) : (
                <div className="text-center py-20 bg-card border rounded-lg flex flex-col items-center">
                    <Clapperboard className="h-16 w-16 text-muted-foreground/50 mb-4" />
                    <h2 className="text-2xl font-semibold mb-2">Nenhum projeto salvo ainda</h2>
                    <p className="text-muted-foreground mb-6">
                    Vá para o editor, crie algo incrível e salve seu projeto para vê-lo aqui.
                    </p>
                    <Link href="/editor-de-video" passHref>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Criar Novo Projeto
                    </Button>
                    </Link>
                </div>
                )}
            </div>
        </main>
        {renameTarget && (
            <RenameProjectDialog
                open={!!renameTarget}
                onOpenChange={(open) => !open && setRenameTarget(null)}
                project={renameTarget}
                onRename={handleRename}
            />
        )}
    </>
  );
}
