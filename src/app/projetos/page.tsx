
"use client";

import { useState } from "react";
import { useProjects } from "@/hooks/use-projects";
import { useToast } from "@/hooks/use-toast";
import { ProjectHeader } from "./components/project-header";
import { ProjectItem } from "./components/project-item";
import { ProjectEmpty } from "./components/project-empty";
import { RenameProjectDialog } from "./components/rename-project-dialog";



// Página para exibir os projetos salvos pelo usuário.
export default function MyProjectsPage() {
  const { projects, removeProject, renameProject, isLoaded } = useProjects();
  const { toast } = useToast();
  const [renameTarget, setRenameTarget] = useState<{ id: string; name: string } | null>(null);

  const handleRemove = (id: string, name: string) => {
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
                <ProjectHeader />

                {isLoaded && projects.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                    {projects.map((project) => (
                        <ProjectItem 
                            key={project.id} 
                            project={project} 
                            onRename={() => setRenameTarget({id: project.id, name: project.name})}
                            onDelete={() => handleRemove(project.id, project.name)}
                        />
                    ))}
                </div>
                ) : (
                    <ProjectEmpty />
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
