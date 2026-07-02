"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, MoreVertical } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

interface ProjectItemProps {
    project: {
        id: string;
        name: string;
        thumbnail: string;
        updatedAt: string | number;
    };
    onRename: () => void;
    onDelete: () => void;
}

export function ProjectItem({ project, onRename, onDelete }: ProjectItemProps) {
    return (
        <Link href={`/editor-de-video?projectId=${project.id}`} passHref className="group">
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
                            <DropdownMenuItem onClick={onRename}>
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
                                        <AlertDialogAction onClick={(e) => { e.preventDefault(); onDelete(); }}>Excluir</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </CardFooter>
            </Card>
        </Link>
    );
}
