"use client";

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface CadastroFormFieldsProps {
    quote: string;
    onQuoteChange: (value: string) => void;
    author: string;
    onAuthorChange: (value: string) => void;
}

export function CadastroFormFields({
    quote,
    onQuoteChange,
    author,
    onAuthorChange
}: CadastroFormFieldsProps) {
    return (
        <>
            <div className="space-y-2">
                <Label htmlFor="quote-text" className="text-primary">Frase</Label>
                <Textarea
                    id="quote-text"
                    placeholder="Digite a frase aqui..."
                    value={quote}
                    onChange={(e) => onQuoteChange(e.target.value)}
                    rows={4}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="author-name" className="text-primary">Autor</Label>
                <Input
                    id="author-name"
                    placeholder="Ex: Albert Einstein"
                    value={author}
                    onChange={(e) => onAuthorChange(e.target.value)}
                />
            </div>
        </>
    );
}
