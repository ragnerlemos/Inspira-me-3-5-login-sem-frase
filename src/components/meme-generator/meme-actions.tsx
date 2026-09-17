"use client";

import { Button } from '@/components/ui/button';
import { Loader2, Share2, Download, Copy, X } from 'lucide-react';

interface MemeActionsProps {
    isSharingSupported: boolean;
    isCopyingImage: boolean;
    isSharingImage: boolean;
    onShare: () => void;
    onDownload: () => void;
    onCopy: () => void;
    onClose?: () => void;
    disabled: boolean;
}

export function MemeActions({
    isSharingSupported,
    isCopyingImage,
    isSharingImage,
    onShare,
    onDownload,
    onCopy,
    onClose,
    disabled
}: MemeActionsProps) {
    const gridColsClass = isSharingSupported 
        ? (onClose ? 'grid-cols-4' : 'grid-cols-3') 
        : (onClose ? 'grid-cols-3' : 'grid-cols-2');

    return (
        <div className={`grid ${gridColsClass} gap-1.5 sm:gap-2 w-full mt-2`}>
            {onClose && (
                <Button
                    variant="outline"
                    className="bg-red-950/50 hover:bg-red-900/70 text-red-200 hover:text-red-100 border border-red-800/40 font-semibold py-2 px-1 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer truncate transition-colors"
                    onClick={onClose}
                >
                    <X className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">Sair</span>
                </Button>
            )}
            {isSharingSupported && (
                <Button
                    variant="default"
                    disabled={disabled}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 px-1 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer truncate"
                    onClick={onShare}
                >
                    {isSharingImage ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
                    ) : (
                        <Share2 className="h-3.5 w-3.5 shrink-0" />
                    )}
                    <span className="truncate">Compartilhar</span>
                </Button>
            )}
            <Button
                variant="outline"
                disabled={disabled}
                className="bg-[#1e293b] hover:bg-slate-800 text-slate-100 border-none font-semibold py-2 px-1 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer truncate"
                onClick={onDownload}
            >
                <Download className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">Baixar</span>
            </Button>
            <Button
                variant="secondary"
                disabled={disabled}
                className="bg-[#1e293b] hover:bg-slate-800 text-slate-100 font-semibold py-2 px-1 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer truncate"
                onClick={onCopy}
            >
                {isCopyingImage ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
                ) : (
                    <Copy className="h-3.5 w-3.5 shrink-0" />
                )}
                <span className="truncate">Copiar</span>
            </Button>
        </div>
    );
}
