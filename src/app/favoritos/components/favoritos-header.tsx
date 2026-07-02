"use client";

export function FavoritosHeader() {
    return (
        <div className="text-center mb-8">
            <h1 className="font-headline text-4xl md:text-5xl font-bold text-[var(--theme-title-color)]">Meus Favoritos</h1>
            <p className="text-muted-foreground mt-2 text-lg text-[var(--theme-subtitle-color)]">Suas frases mais queridas, salvas em um só lugar.</p>
        </div>
    );
}
