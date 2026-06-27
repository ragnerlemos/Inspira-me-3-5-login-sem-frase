'use client';

import React, { useState, useEffect } from 'react';
import { useGoogleSheets } from './google-sheets-provider';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Loader2, Table, FileSpreadsheet, RefreshCw, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function SheetSelector({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { 
    accessToken, 
    isConnected, 
    isConnecting, 
    connect, 
    disconnect, 
    spreadsheetId, 
    setSpreadsheetId,
    sheetName,
    setSheetName,
    user
  } = useGoogleSheets();
  
  const [spreadsheets, setSpreadsheets] = useState<{ id: string, name: string }[]>([]);
  const [tabs, setTabs] = useState<string[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isLoadingTabs, setIsLoadingTabs] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isConnected && open) {
      loadSpreadsheets();
    }
  }, [isConnected, open]);

  useEffect(() => {
    if (spreadsheetId && isConnected && open) {
      loadTabs(spreadsheetId);
    } else {
      setTabs([]);
    }
  }, [spreadsheetId, isConnected, open]);

  const loadSpreadsheets = async () => {
    setIsLoadingFiles(true);
    try {
      const res = await fetch('/api/google/sheets/list', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSpreadsheets(data);
      } else {
        throw new Error('Falha ao listar planilhas');
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar arquivos",
        description: "Não foi possível carregar suas planilhas do Google Drive.",
      });
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const loadTabs = async (id: string) => {
    setIsLoadingTabs(true);
    try {
      const res = await fetch(`/api/google/sheets/meta?spreadsheetId=${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTabs(data.sheetNames);
        if (data.sheetNames.length > 0 && !data.sheetNames.includes(sheetName)) {
            setSheetName(data.sheetNames[0]);
        }
      } else {
        throw new Error('Falha ao carregar abas');
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar abas",
        description: "Não foi possível carregar as abas da planilha selecionada.",
      });
    } finally {
      setIsLoadingTabs(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-[#020817] text-slate-100 border-slate-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-green-500" />
            Configurar Google Sheets
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Conecte sua conta e selecione a planilha que deseja usar como fonte de frases.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {!isConnected ? (
            <div className="flex flex-col items-center justify-center py-8 gap-4 border-2 border-dashed border-slate-800 rounded-xl">
              <p className="text-sm text-slate-400 text-center px-4">
                Você precisa autorizar o acesso ao seu Google Drive para listar suas planilhas.
              </p>
              <Button 
                onClick={connect} 
                disabled={isConnecting}
                className="bg-primary hover:bg-primary/90"
              >
                {isConnecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Conectar Conta Google
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    {user?.displayName?.charAt(0) || 'U'}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-medium truncate">{user?.displayName}</span>
                    <span className="text-xs text-slate-500 truncate">{user?.email}</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={disconnect} className="text-slate-400 hover:text-red-400">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Planilha</label>
                <div className="flex gap-2">
                  <Select 
                    value={spreadsheetId || ""} 
                    onValueChange={(val) => setSpreadsheetId(val)}
                  >
                    <SelectTrigger className="bg-slate-900 border-slate-800">
                      <SelectValue placeholder={isLoadingFiles ? "Carregando..." : "Selecione uma planilha"} />
                    </SelectTrigger>
                    <SelectContent className="bg-[#020817] border-slate-800 text-slate-100">
                      {spreadsheets.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon" onClick={loadSpreadsheets} disabled={isLoadingFiles} className="border-slate-800">
                    <RefreshCw className={cn("h-4 w-4", isLoadingFiles && "animate-spin")} />
                  </Button>
                </div>
              </div>

              {spreadsheetId && (
                <div className="grid gap-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-sm font-medium">Aba (Página)</label>
                  <Select 
                    value={sheetName || ""} 
                    onValueChange={(val) => setSheetName(val)}
                    disabled={isLoadingTabs}
                  >
                    <SelectTrigger className="bg-slate-900 border-slate-800">
                      <SelectValue placeholder={isLoadingTabs ? "Carregando..." : "Selecione uma aba"} />
                    </SelectTrigger>
                    <SelectContent className="bg-[#020817] border-slate-800 text-slate-100">
                      {tabs.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            className="text-slate-400 hover:text-slate-100"
          >
            Fechar
          </Button>
          {isConnected && spreadsheetId && sheetName && (
            <Button onClick={() => onOpenChange(false)} className="bg-green-600 hover:bg-green-700">
              Confirmar Seleção
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
