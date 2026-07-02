"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Library } from "lucide-react";

import Image from 'next/image';

interface GalleryItemProps {
    item: {
        id: string;
        name: string;
        src: string;
        type: 'image' | 'video' | 'audio';
    };
}

export function GalleryItem({ item }: GalleryItemProps) {
    return (
        <Card>
            <CardContent className="p-2">
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
                        <Library className="h-10 w-10 text-muted-foreground" />
                    )}
                </div>
                <p className="text-xs truncate mt-2 font-medium px-1">{item.name}</p>
            </CardContent>
        </Card>
    );
}
