
'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useTemplates } from '@/hooks/use-templates';
import { Card, CardContent } from '@/components/ui/card';
import { FilePlus, Trash2, MoreVertical, Edit, Twitter, Upload, List, Grid2X2, Grid3X3, Columns4 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { IconeTwitter } from './icone-twitter';
import { IconeModeloPadrao } from './icone-modelo-padrao';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type ViewMode = 'list' | '2' | '3' | '4';


function TemplateSkeleton() {
    return (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
                 <Card key={i} className="animate-pulse">
                    <div className="aspect-square bg-muted rounded-t-lg"></div>
                    <CardContent className="p-2 space-y-1">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

function RenameTemplateDialog({ open, onOpenChange, template, onRename }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    template: { id: string; name: string };
    onRename: (newName: string) => void;
}) {
    const [newName, setNewName] = useState(template.name);
    
    const handleRename = () => {
        onRename(newName);
        onOpenChange(false);
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Renomear Modelo</AlertDialogTitle>
                    <AlertDialogDescription>
                        Digite o novo nome para o modelo "{template.name}".
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-2">
                    <Label htmlFor="template-new-name" className="sr-only">Novo Nome</Label>
                    <Input id="template-new-name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Novo nome..." />
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRename}>Salvar</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

function UploadTemplateDialog({ open, onOpenChange, onUpload }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpload: (name: string, dataUrl: string) => void;
}) {
    const [name, setName] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!name) {
            setName(file.name.replace(/\.[^/.]+$/, ""));
        }
        const reader = new FileReader();
        reader.onload = (uploadEvent) => {
            setImagePreview(uploadEvent.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = () => {
        if (!imagePreview || !name) return;
        onUpload(name, imagePreview);
        setImagePreview(null);
        setName('');
        onOpenChange(false);
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Upar Novo Modelo (Stories)</AlertDialogTitle>
                    <AlertDialogDescription>
                        Envie uma imagem pronta no formato stories (ex: 9:16) para usar como seu modelo de fundo.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="model-name">Nome do Modelo</Label>
                        <Input id="model-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Meu Story Estiloso" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="model-file">Imagem (Stories)</Label>
                        <Input id="model-file" type="file" accept="image/*" onChange={handleFileChange} />
                    </div>
                    {imagePreview && (
                        <div className="relative w-32 h-56 mx-auto rounded-lg overflow-hidden border">
                            <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                        </div>
                    )}
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSubmit} disabled={!imagePreview || !name}>Upar Modelo</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

// Página que exibe uma galeria de modelos de vídeo que os usuários podem utilizar.
export default function ModelosClientPage() {
    const searchParams = useSearchParams();
    const quote = searchParams.get('quote');
    const { templates, addTemplate, removeTemplate, renameTemplate, isLoaded } = useTemplates();
    const { toast } = useToast();
    
    const [renameTarget, setRenameTarget] = useState<{ id: string; name: string } | null>(null);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('4');

    useEffect(() => {
        const savedMode = localStorage.getItem('modelos_view_mode') as ViewMode | null;
        if (savedMode && ['list', '2', '3', '4'].includes(savedMode)) {
            setViewMode(savedMode);
        }
    }, []);

    const handleViewModeChange = (mode: ViewMode) => {
        setViewMode(mode);
        localStorage.setItem('modelos_view_mode', mode);
    };

    const getGridClassName = () => {
        switch (viewMode) {
            case 'list':
                return 'flex flex-col gap-3';
            case '2':
                return 'grid grid-cols-2 gap-3 sm:gap-4';
            case '3':
                return 'grid grid-cols-3 gap-2 sm:gap-4';
            case '4':
            default:
                return 'grid grid-cols-4 gap-2 sm:gap-3';
        }
    };

    const handleRemove = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        removeTemplate(id);
        toast({ title: "Modelo excluído!", description: "O modelo foi removido da sua coleção." });
    };

    const handleRename = (newName: string) => {
        if (!renameTarget) return;
        renameTemplate(renameTarget.id, newName);
        toast({ title: "Modelo Renomeado!", description: "O nome do modelo foi atualizado."});
        setRenameTarget(null);
    };

    const handleUploadTemplate = (name: string, dataUrl: string) => {
        addTemplate(name, {
            aspectRatio: '9 / 16',
            backgroundStyle: { type: 'media', value: dataUrl },
            activeTemplateId: 'custom',
        }, dataUrl);
        toast({ title: "Modelo upado com sucesso!", description: `O modelo "${name}" foi adicionado aos seus modelos.` });
    };
    
    if (!isLoaded) {
        return (
             <main className="overflow-y-auto">
                <div className="container mx-auto py-8 px-4">
                    <div className="text-center mb-8">
                        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">Modelos</h1>
                        <p className="text-muted-foreground mt-2 text-lg">Carregando seus modelos...</p>
                    </div>
                   <TemplateSkeleton />
                </div>
            </main>
        )
    }

    const customTemplates = templates.filter(t => t.isCustom);
    const defaultTemplates = templates.filter(t => !t.isCustom);

    const renderViewModeSelector = () => (
        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border/50 self-end sm:self-auto">
            <Button
                type="button"
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                className={cn("h-7 px-2 text-xs gap-1.5", viewMode === 'list' && "bg-background shadow-xs font-medium text-foreground")}
                onClick={() => handleViewModeChange('list')}
                title="Visualização em Lista"
            >
                <List className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Lista</span>
            </Button>
            <Button
                type="button"
                variant={viewMode === '2' ? 'secondary' : 'ghost'}
                size="sm"
                className={cn("h-7 px-2 text-xs gap-1.5", viewMode === '2' && "bg-background shadow-xs font-medium text-foreground")}
                onClick={() => handleViewModeChange('2')}
                title="2 Colunas"
            >
                <Grid2X2 className="h-3.5 w-3.5" />
                <span>2 Col</span>
            </Button>
            <Button
                type="button"
                variant={viewMode === '3' ? 'secondary' : 'ghost'}
                size="sm"
                className={cn("h-7 px-2 text-xs gap-1.5", viewMode === '3' && "bg-background shadow-xs font-medium text-foreground")}
                onClick={() => handleViewModeChange('3')}
                title="3 Colunas"
            >
                <Grid3X3 className="h-3.5 w-3.5" />
                <span>3 Col</span>
            </Button>
            <Button
                type="button"
                variant={viewMode === '4' ? 'secondary' : 'ghost'}
                size="sm"
                className={cn("h-7 px-2 text-xs gap-1.5", viewMode === '4' && "bg-background shadow-xs font-medium text-foreground")}
                onClick={() => handleViewModeChange('4')}
                title="4 Colunas"
            >
                <Columns4 className="h-3.5 w-3.5" />
                <span>4 Col</span>
            </Button>
        </div>
    );

  return (
    <main className="overflow-y-auto">
        <div className="container mx-auto py-8 px-4">
             <div className="text-center mb-8">
                <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">Modelos</h1>
                <p className="text-muted-foreground mt-2 text-lg">Comece com um modelo ou crie do zero.</p>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                    <Button onClick={() => setIsUploadOpen(true)} className="gap-2">
                        <Upload className="h-4 w-4" />
                        Upar Modelo (Stories)
                    </Button>
                </div>
            </div>

            <div className="mb-12">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                    <h2 className="text-2xl font-headline font-bold">Modelos Padrão</h2>
                    {renderViewModeSelector()}
                </div>

                <div className={getGridClassName()}>
                    {defaultTemplates.map((template) => {
                    const editorUrl = new URLSearchParams();
                    editorUrl.set('templateId', template.id.toString());
                    if (quote) {
                        editorUrl.set('quote', quote);
                    }
                    
                    if (viewMode === 'list') {
                        return (
                            <Link key={template.id} href={`/editor-de-video?${editorUrl.toString()}`} passHref className="group">
                                <Card className="overflow-hidden hover:border-primary/50 transition-colors p-3 flex items-center gap-4">
                                    <div className="relative w-16 h-28 shrink-0 bg-muted overflow-hidden rounded-md border flex items-center justify-center">
                                        {template.thumbnail ? (
                                            <Image
                                                src={template.thumbnail}
                                                alt={template.name}
                                                fill
                                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full w-full">
                                                {template.id === 'template-default' && <IconeModeloPadrao className="h-8 w-8 text-muted-foreground/50" />}
                                                {template.id === 'template-twitter' && <IconeTwitter className="h-8 w-8 text-muted-foreground/50" />}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-sm sm:text-base truncate group-hover:text-primary transition-colors">{template.name}</h3>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Proporção: {template.editorState.aspectRatio || '9:16'}
                                        </p>
                                        <span className="inline-block mt-2 text-[11px] font-medium bg-primary/10 text-primary px-2 py-0.5 rounded">
                                            Modelo Oficial
                                        </span>
                                    </div>
                                    <Button variant="outline" size="sm" className="shrink-0 text-xs">
                                        Abrir no Editor
                                    </Button>
                                </Card>
                            </Link>
                        );
                    }

                    return (
                        <Link key={template.id} href={`/editor-de-video?${editorUrl.toString()}`} passHref className="group">
                            <Card className="overflow-hidden flex flex-col h-full hover:border-primary/50 transition-colors">
                            <div className={cn(
                                "relative w-full flex items-center justify-center bg-muted aspect-[9/16] overflow-hidden rounded-t-lg"
                            )}>
                                {template.thumbnail ? (
                                    <Image
                                        src={template.thumbnail}
                                        alt={template.name}
                                        fill
                                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full transition-colors group-hover:bg-muted/80 p-4 w-full">
                                        {template.id === 'template-default' && <IconeModeloPadrao className="h-16 w-16 text-muted-foreground/50" />}
                                        {template.id === 'template-twitter' && <IconeTwitter className="h-16 w-16 text-muted-foreground/50" />}
                                    </div>
                                )}
                            </div>
                            <CardContent className={cn("bg-card mt-auto border-t", viewMode === '4' ? "p-2" : "p-3")}>
                                <p className={cn("font-semibold truncate", viewMode === '4' ? "text-[11px]" : "text-xs")}>{template.name}</p>
                                <p className={cn("text-muted-foreground mt-0.5", viewMode === '4' ? "text-[9px]" : "text-[10px]")}>
                                    Proporção: {template.editorState.aspectRatio || '9:16'}
                                </p>
                            </CardContent>
                            </Card>
                        </Link>
                    );
                    })}
                </div>
            </div>
            
            {customTemplates.length > 0 && (
                <div>
                    <div className="flex items-center justify-between gap-3 mb-4">
                        <h2 className="text-2xl font-headline font-bold">Meus Modelos</h2>
                    </div>
                    <div className={getGridClassName()}>
                        {customTemplates.map((template) => {
                            const editorUrl = new URLSearchParams();
                            editorUrl.set('templateId', template.id);
                            if (quote) editorUrl.set('quote', quote);

                            if (viewMode === 'list') {
                                return (
                                    <Link key={template.id} href={`/editor-de-video?${editorUrl.toString()}`} passHref className="group">
                                        <Card className="overflow-hidden hover:border-primary/50 transition-colors p-3 flex items-center gap-4 relative">
                                            <div className="relative w-16 h-28 shrink-0 bg-muted overflow-hidden rounded-md border flex items-center justify-center">
                                                {template.thumbnail ? (
                                                    <Image
                                                        src={template.thumbnail}
                                                        alt={template.name}
                                                        fill
                                                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-muted-foreground/40">
                                                        <IconeModeloPadrao className="h-8 w-8" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0 pr-8">
                                                <h3 className="font-semibold text-sm sm:text-base truncate group-hover:text-primary transition-colors">{template.name}</h3>
                                                {template.createdAt && (
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Criado em: {new Date(template.createdAt).toLocaleDateString()}
                                                    </p>
                                                )}
                                                <span className="inline-block mt-2 text-[11px] font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded">
                                                    Personalizado
                                                </span>
                                            </div>
                                            {template.isCustom && (
                                                <div className="shrink-0 flex items-center gap-1" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                            >
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                                                            <DropdownMenuItem onClick={() => setRenameTarget({ id: template.id, name: template.name })}>
                                                                    <Edit className="mr-2 h-4 w-4" />
                                                                    Renomear
                                                            </DropdownMenuItem>
                                                            <AlertDialog>
                                                                    <AlertDialogTrigger asChild>
                                                                        <button className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full text-destructive">
                                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                                            Excluir
                                                                        </button>
                                                                    </AlertDialogTrigger>
                                                                    <AlertDialogContent>
                                                                        <AlertDialogHeader>
                                                                            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                                                            <AlertDialogDescription>
                                                                                Esta ação não pode ser desfeita. Isso excluirá permanentemente o seu modelo "{template.name}".
                                                                            </AlertDialogDescription>
                                                                        </AlertDialogHeader>
                                                                        <AlertDialogFooter>
                                                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                            <AlertDialogAction onClick={(e) => handleRemove(e, template.id)}>Excluir</AlertDialogAction>
                                                                        </AlertDialogFooter>
                                                                    </AlertDialogContent>
                                                                </AlertDialog>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            )}
                                        </Card>
                                    </Link>
                                );
                            }

                            return (
                                <Link key={template.id} href={`/editor-de-video?${editorUrl.toString()}`} passHref className="group">
                                    <Card className="overflow-hidden flex flex-col h-full relative hover:border-primary/50 transition-colors">
                                        {template.isCustom && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="secondary"
                                                    size="icon"
                                                    className="absolute top-2 right-2 z-10 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                                >
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                                                <DropdownMenuItem onClick={() => setRenameTarget({ id: template.id, name: template.name })}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Renomear
                                                </DropdownMenuItem>
                                                <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <button className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full text-destructive">
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Excluir
                                                            </button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Esta ação não pode ser desfeita. Isso excluirá permanentemente o seu modelo "{template.name}".
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                <AlertDialogAction onClick={(e) => handleRemove(e, template.id)}>Excluir</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        )}
                                        <div className="relative w-full aspect-[9/16] overflow-hidden rounded-t-lg bg-muted">
                                            {template.thumbnail ? (
                                                <Image
                                                    src={template.thumbnail}
                                                    alt={template.name}
                                                    fill
                                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-muted-foreground/40">
                                                    <IconeModeloPadrao className="h-16 w-16" />
                                                </div>
                                            )}
                                        </div>
                                        <CardContent className={cn("bg-card mt-auto border-t", viewMode === '4' ? "p-2" : "p-3")}>
                                            <p className={cn("font-semibold truncate", viewMode === '4' ? "text-[11px]" : "text-xs")}>{template.name}</p>
                                            {template.createdAt && <p className={cn("text-muted-foreground mt-0.5", viewMode === '4' ? "text-[9px]" : "text-[10px]")}>{new Date(template.createdAt).toLocaleDateString()}</p>}
                                        </CardContent>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}

            {templates.length === 0 && !isLoaded && <p>Carregando modelos...</p>}
            {templates.length === 0 && isLoaded && (
                <div className="text-center py-16">
                    <h2 className="text-2xl font-bold mb-2">Nenhum modelo encontrado</h2>
                    <p className="text-muted-foreground">Crie seu primeiro modelo no editor para vê-lo aqui.</p>
                </div>
            )}
        </div>
        {renameTarget && (
            <RenameTemplateDialog
                open={!!renameTarget}
                onOpenChange={(open) => !open && setRenameTarget(null)}
                template={renameTarget}
                onRename={handleRename}
            />
        )}
        <UploadTemplateDialog
            open={isUploadOpen}
            onOpenChange={setIsUploadOpen}
            onUpload={handleUploadTemplate}
        />
    </main>
  );
}
