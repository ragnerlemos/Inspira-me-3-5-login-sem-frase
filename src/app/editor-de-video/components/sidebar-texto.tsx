"use client";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import TextareaAutosize from 'react-textarea-autosize';

export interface SidebarTextoProps {
    text: string;
    setText: (text: string) => void;
}

export function SidebarTexto({ text, setText }: SidebarTextoProps) {
    return (
        <div className="p-4 flex-1 flex flex-col">
            <Label htmlFor="text-input" className="sr-only">Texto da Frase</Label>
            <TextareaAutosize
                id="text-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                minRows={6}
                placeholder="Digite sua frase aqui..."
                className={cn(
                    'flex w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm'
                )}
            />
        </div>
    );
}
