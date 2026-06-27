// Componente reutilizável para os botões da barra de ferramentas do editor.
// Exibe um ícone e um texto, e responde a um evento de clique.

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface BotaoRecursoProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  isActive?: boolean;
}

export function BotaoRecurso({ icon: Icon, label, onClick, isActive }: BotaoRecursoProps) {
  return (
    <Button
      variant="ghost"
      className={cn(
        "flex flex-col items-center justify-center h-full text-muted-foreground px-3",
        isActive && "text-primary bg-primary/10"
      )}
      onClick={onClick}
    >
      <Icon className="h-5 w-5 mb-1" />
      <span className="text-xs">{label}</span>
    </Button>
  );
}
