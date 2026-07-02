"use client";

import { Button } from '@/components/ui/button';
import { Loader2, Share2, Download, Copy } from 'lucide-react';

interface MemeActionsProps {
    isSharingSupported: boolean;
    isCopyingImage: boolean;
    isSharingImage: boolean;
    onShare: () => void;
    onDownload: () => void;
    onCopy: () => void;
    disabled: boolean;
}

export function MemeActions({
    isSharingSupported,
    isCopyingImage,
    isSharingImage,
    onShare,
    onDownload,
    onCopy,
    disabled
}: MemeActionsProps) {
    return (
        <div className="flex flex-col gap-2 w-full mt-2">
            {isSharingSupported && (
                <Button
                    variant="default"
                    disabled={disabled}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer"
                    onClick={onShare}
                >
                    {isSharingImage ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Share2 className="h-4 w-4" />
                    )}
                    Compartilhar Imagem
                </Button>
            )}
            <div className="grid grid-cols-2 gap-3 w-full">
                <Button
                    variant="outline"
                    disabled={disabled}
                    className="bg-[#1e293b] hover:bg-slate-800 text-slate-100 border-none font-semibold py-2 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer"
                    onClick={onDownload}
                >
                    <Download className="h-4 w-4" />
                    Baixar
                </Button>
                <Button
                    variant="secondary"
                    disabled={disabled}
                    className="bg-[#1e293b] hover:bg-slate-800 text-slate-100 font-semibold py-2 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer"
                    onClick={onCopy}
                >
                    {isCopyingImage ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Copy className="h-4 w-4" />
                    )}
                    Copiar Imagem
                </Button>
            </div>
        </div>
    );
}
