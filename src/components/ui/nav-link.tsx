
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
  const isActive = pathname === href || (href === "/frases" && pathname === "/");

  return (
    <Link
      href={href}
      prefetch={true}
      className={cn(
        buttonVariants({ variant: isActive ? "secondary" : "ghost", size: "sm" }),
        "justify-start transition-all duration-150 active:scale-95 select-none font-medium"
      )}
      onClick={(e) => {
        if (isActive && !href.includes("?")) {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
        onClick?.();
      }}
    >
      <Icon className="mr-2 h-4 w-4 text-[var(--theme-menu-icon-color)] shrink-0" />
      <span>{label}</span>
    </Link>
  );
}

