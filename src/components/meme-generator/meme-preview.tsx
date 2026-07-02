"use client";

import Image from 'next/image';
import { Loader2 } from 'lucide-react';

interface MemePreviewProps {
    memeUrl: string | null;
    onDownload: () => void;
}

export function MemePreview({ memeUrl, onDownload }: MemePreviewProps) {
    if (!memeUrl) {
        return (
            <div className="text-white text-center flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-lg font-bold">Gerando seu meme...</p>
            </div>
        );
    }

    return (
        <>
            <p className="text-white text-md font-semibold text-center leading-tight">Visualizar Imagem</p>
            <div className="relative max-w-[75vw] max-h-[55vh] w-full aspect-[9/16] rounded-lg shadow-2xl overflow-hidden border border-[#1e293b] cursor-pointer" onClick={onDownload}>
                <Image 
                    src={memeUrl} 
                    alt="Pré-visualização do Meme" 
                    fill
                    className="object-contain"
                    unoptimized
                    referrerPolicy="no-referrer"
                />
            </div>
        </>
    );
}
