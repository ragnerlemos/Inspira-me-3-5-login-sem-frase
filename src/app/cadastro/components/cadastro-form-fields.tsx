"use client";

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { ChevronDown, ChevronUp, Copy, Music, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CadastroFormFieldsProps {
    quote: string;
    onQuoteChange: (value: string) => void;
    intro: string;
    onIntroChange: (value: string) => void;
    conclusion: string;
    onConclusionChange: (value: string) => void;
    description: string;
    onDescriptionChange: (value: string) => void;
    music: string;
    onMusicChange: (value: string) => void;
    author: string;
    onAuthorChange: (value: string) => void;
    onCopyDescription: () => void;
}

export function CadastroFormFields({
    quote,
    onQuoteChange,
    intro,
    onIntroChange,
    conclusion,
    onConclusionChange,
    description,
    onDescriptionChange,
    music,
    onMusicChange,
    author,
    onAuthorChange,
    onCopyDescription
}: CadastroFormFieldsProps) {
    const [showIntro, setShowIntro] = useState(false);
    const [showConclusion, setShowConclusion] = useState(false);
    const [showDescription, setShowDescription] = useState(true);
    const [showMusic, setShowMusic] = useState(false);

    return (
        <div className="space-y-4">
            {/* Frase Introdução */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="intro-text" className="text-primary">Frase Introdução (Opcional)</Label>
                    <Button 
                        type="button"
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => setShowIntro(!showIntro)}
                    >
                        {showIntro ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                </div>
                {showIntro && (
                    <Textarea
                        id="intro-text"
                        placeholder="Digite a introdução aqui..."
                        value={intro}
                        onChange={(e) => onIntroChange(e.target.value)}
                        rows={2}
                    />
                )}
            </div>

            {/* Frase Principal */}
            <div className="space-y-2">
                <Label htmlFor="quote-text" className="text-primary font-bold">Frase Principal</Label>
                <Textarea
                    id="quote-text"
                    placeholder="Digite a frase principal aqui..."
                    value={quote}
                    onChange={(e) => onQuoteChange(e.target.value)}
                    rows={4}
                    className="border-2 border-primary/20"
                />
            </div>

            {/* Frase Conclusão */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="conclusion-text" className="text-primary">Frase Conclusão (Opcional)</Label>
                    <Button 
                        type="button"
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => setShowConclusion(!showConclusion)}
                    >
                        {showConclusion ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                </div>
                {showConclusion && (
                    <Textarea
                        id="conclusion-text"
                        placeholder="Digite a conclusão aqui..."
                        value={conclusion}
                        onChange={(e) => onConclusionChange(e.target.value)}
                        rows={2}
                    />
                )}
            </div>

            {/* Descrição e # */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Label htmlFor="description-text" className="text-primary font-semibold">Descrição e #</Label>
                        <Button 
                            type="button"
                            variant="outline" 
                            size="sm" 
                            onClick={onCopyDescription}
                            className="h-7 text-xs px-2 py-0"
                        >
                            <Copy className="mr-1 h-3 w-3" /> Copiar Descrição
                        </Button>
                    </div>
                    <Button 
                        type="button"
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => setShowDescription(!showDescription)}
                    >
                        {showDescription ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                </div>
                {showDescription && (
                    <Textarea
                        id="description-text"
                        placeholder="Digite a descrição e as hashtags..."
                        value={description}
                        onChange={(e) => onDescriptionChange(e.target.value)}
                        rows={3}
                    />
                )}
            </div>

            {/* Música */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="music-text" className="text-primary">Música (Opcional)</Label>
                    <Button 
                        type="button"
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => setShowMusic(!showMusic)}
                    >
                        {showMusic ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                </div>
                {showMusic && (
                    <Input
                        id="music-text"
                        placeholder="Nome da música / áudio..."
                        value={music}
                        onChange={(e) => onMusicChange(e.target.value)}
                    />
                )}
            </div>

            {/* Autor */}
            <div className="space-y-2 pt-2">
                <Label htmlFor="author-name" className="text-primary">Autor</Label>
                <Input
                    id="author-name"
                    placeholder="Ex: Albert Einstein"
                    value={author}
                    onChange={(e) => onAuthorChange(e.target.value)}
                />
            </div>
        </div>
    );
}
