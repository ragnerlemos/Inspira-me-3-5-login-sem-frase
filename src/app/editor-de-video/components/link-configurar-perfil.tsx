"use client";

import Link from 'next/link';
import { ImageUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LinkConfigurarPerfil() {
    return (
      <Link href="/perfil" passHref>
        <Button variant="link" className="w-full text-center">
          <ImageUp className="mr-2 h-4 w-4" />
          Configurar Perfil
        </Button>
      </Link>
    );
}
