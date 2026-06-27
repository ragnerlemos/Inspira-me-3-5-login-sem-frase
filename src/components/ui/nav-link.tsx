
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface NavLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
  onClick?: () => void; // Adiciona a propriedade onClick
}

// Componente para os links de navegação principais, com ícone e texto.
export function NavLink({ href, icon: Icon, label, onClick }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        buttonVariants({ variant: isActive ? "secondary" : "ghost", size: "sm" }),
        "justify-start"
      )}
      onClick={onClick} // Passa o onClick para o componente Link
    >
      <Icon className="mr-2 h-4 w-4 text-[var(--theme-menu-icon-color)]" />
      {label}
    </Link>
  );
}

