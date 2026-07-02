"use client";

import Image from 'next/image';
import { Card } from "@/components/ui/card";
import { IconeTwitter } from '@/app/modelos/icone-twitter';
import { IconeModeloPadrao } from '@/app/modelos/icone-modelo-padrao';
import type { EditorState } from "../../tipos";

interface ModelItemProps {
    template: {
        id: string;
        name: string;
        thumbnail?: string;
        editorState: EditorState;
    };
    onSelect: (state: EditorState) => void;
}

export function ModelItem({ template, onSelect }: ModelItemProps) {
    return (
        <div 
            onClick={() => onSelect(template.editorState)} 
            className="cursor-pointer group"
            title={template.name}
        >
            <Card className="overflow-hidden flex flex-col h-full bg-transparent border shadow-sm group-hover:border-primary transition-colors">
                <div className="relative w-full aspect-square flex items-center justify-center bg-muted/30">
                    {template.thumbnail ? (
                        <Image
                            src={template.thumbnail}
                            alt={template.name}
                            fill
                            className="object-cover"
                            unoptimized
                            referrerPolicy="no-referrer"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full p-2">
                            {template.id === 'template-default' && <IconeModeloPadrao className="h-8 w-8 text-muted-foreground/50" />}
                            {template.id === 'template-twitter' && <IconeTwitter className="h-8 w-8 text-muted-foreground/50" />}
                            {!template.id.includes('default') && !template.id.includes('twitter') && (
                                <span className="text-[10px] text-muted-foreground/50 text-center px-1">Sem Prévia</span>
                            )}
                        </div>
                    )}
                </div>
            </Card>
            <p className="text-[10px] text-center mt-1 truncate text-muted-foreground group-hover:text-foreground">
                {template.name}
            </p>
        </div>
    );
}
