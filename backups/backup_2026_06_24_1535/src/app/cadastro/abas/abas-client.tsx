'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Edit, RefreshCw } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { fetchWithBase } from '@/lib/api-client';

interface AbasClientPageProps {
  initialSheetNames: string[];
}

export function AbasClientPage({ initialSheetNames }: AbasClientPageProps) {
  const [sheetNames, setSheetNames] = useState<string[]>(initialSheetNames);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const [editingSheet, setEditingSheet] = useState<string | null>(null);
  const [newSheetName, setNewSheetName] = useState('');
  const [isUpdatingSheet, setIsUpdatingSheet] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    toast({ title: 'Atualizando...', description: 'Buscando a lista de abas mais recente.' });
    try {
        await fetchWithBase('/api/invalidate-cache', { method: 'POST' });
    } catch (error) {
        console.error("Falha ao invalidar o cache:", error);
    } finally {
        window.location.reload();
    }
  };

  const handleEditSheetClick = (sheetName: string) => {
    setEditingSheet(sheetName);
    setNewSheetName(sheetName);
  };

  const handleUpdateSheet = async () => {
    if (!editingSheet || !newSheetName.trim()) return;
    
    setIsUpdatingSheet(true);
    try {
        const response = await fetchWithBase('/api/sheets/renameSheet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                oldSheetName: editingSheet,
                newSheetName: newSheetName.trim(),
            }),
        });

        const result = await response.json();

        if (response.ok) {
            toast({
                title: "Aba Atualizada!",
                description: `O nome foi alterado para "${newSheetName.trim()}". A página será recarregada.`,
            });
            await handleRefresh();
        } else {
            throw new Error(result.details || result.error || "Erro desconhecido");
        }
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Erro ao Renomear Aba",
            description: error instanceof Error ? error.message : "Ocorreu um problema ao renomear a aba.",
        });
    } finally {
        setIsUpdatingSheet(false);
        setEditingSheet(null);
    }
  };
  
  return (
    <main className="overflow-y-auto">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Gerenciar Abas</CardTitle>
                        <CardDescription>
                            Visualize e edite os nomes das abas da sua planilha.
                        </CardDescription>
                    </div>
                    <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
                        {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-2">
                {sheetNames.length > 0 ? (
                    sheetNames.map(sheetName => (
                        <div key={sheetName} className="flex items-center justify-between p-3 rounded-lg border bg-secondary/30">
                            <span className="font-medium">{sheetName}</span>
                            <Button variant="ghost" size="icon" onClick={() => handleEditSheetClick(sheetName)}>
                                <Edit className="h-4 w-4" />
                            </Button>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-muted-foreground py-8">Nenhuma aba encontrada.</p>
                )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <AlertDialog open={!!editingSheet} onOpenChange={(isOpen) => !isOpen && setEditingSheet(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Renomear Aba</AlertDialogTitle>
                <AlertDialogDescription>
                    Alterando o nome da aba "{editingSheet}".
                </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
                <Label htmlFor="new-sheet-name">Novo nome da Aba</Label>
                <Input
                    id="new-sheet-name"
                    value={newSheetName}
                    onChange={(e) => setNewSheetName(e.target.value)}
                    placeholder="Digite o novo nome"
                    autoFocus
                />
            </div>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleUpdateSheet} disabled={isUpdatingSheet}>
                    {isUpdatingSheet && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isUpdatingSheet ? "Renomeando..." : "Renomear"}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
