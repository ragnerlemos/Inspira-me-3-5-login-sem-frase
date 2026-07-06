"use client";

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function ProfileHeader() {
    const router = useRouter();

    return (
        <div className="relative mb-8 text-center">
            <Button
                variant="ghost"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2"
                onClick={() => router.back()}
                aria-label="Voltar"
            >
                <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="mx-auto max-w-2xl">
                <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">Central de Marca</h1>
                <p className="mt-2 text-lg text-muted-foreground">Gerencie sua identidade visual, logotipo e assinatura em um só lugar.</p>
            </div>
        </div>
    );
}
