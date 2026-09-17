"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Library } from "lucide-react";
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface GalleryItemProps {
    item: {
        id: string;
        name: string;
        src: string;
        type: 'image' | 'video' | 'audio';
    };
    viewMode?: 'list' | '2' | '3' | '4';
}

export function GalleryItem({ item, viewMode = '4' }: GalleryItemProps) {
    if (viewMode === 'list') {
        return (
            <Card className="hover:border-primary/50 transition-colors">
                <CardContent className="p-3 flex items-center gap-4">
                    <div className="w-16 h-16 shrink-0 bg-muted rounded-md flex items-center justify-center overflow-hidden relative border">
                        {item.type === 'image' && (
                            <Image 
                                src={item.src} 
                                alt={item.name} 
                                fill 
                                className="object-cover rounded-md" 
                                unoptimized 
                                referrerPolicy="no-referrer"
                            />
                        )}
                        {item.type === 'video' && (
                            <video src={item.src} className="object-cover w-full h-full rounded-md" />
                        )}
                        {item.type === 'audio' && (
                            <Library className="h-8 w-8 text-muted-foreground" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{item.name}</p>
                        <span className="inline-block mt-1 text-[11px] font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded capitalize">
                            {item.type === 'image' ? 'Imagem' : item.type === 'video' ? 'Vídeo' : 'Áudio'}
                        </span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="hover:border-primary/50 transition-colors">
            <CardContent className={viewMode === '4' ? "p-1.5" : "p-2"}>
                <div className="aspect-square bg-muted rounded-md flex items-center justify-center overflow-hidden relative">
                    {item.type === 'image' && (
                        <Image 
                            src={item.src} 
                            alt={item.name} 
                            fill 
                            className="object-cover rounded-md" 
                            unoptimized 
                            referrerPolicy="no-referrer"
                        />
                    )}
                    {item.type === 'video' && (
                        <video src={item.src} className="object-cover w-full h-full rounded-md" />
                    )}
                    {item.type === 'audio' && (
                        <Library className={viewMode === '4' ? "h-6 w-6 text-muted-foreground" : "h-10 w-10 text-muted-foreground"} />
                    )}
                </div>
                <p className={cn("truncate mt-1.5 font-medium px-0.5", viewMode === '4' ? "text-[11px]" : "text-xs")}>{item.name}</p>
            </CardContent>
        </Card>
    );
}
