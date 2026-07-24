"use client";

import { useState, useEffect, type ReactNode } from "react";

interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Componente que renderiza seus filhos apenas no lado do cliente.
 * Isso é útil para evitar erros de hidratação (hydration mismatch) com bibliotecas
 * que geram IDs únicos ou dependem de APIs do navegador durante a renderização inicial.
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
