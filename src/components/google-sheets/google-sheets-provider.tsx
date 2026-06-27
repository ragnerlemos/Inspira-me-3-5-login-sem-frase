'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import { initGoogleAuth, googleSignIn, logoutGoogle, getCachedAccessToken } from '@/lib/google-auth';
import { useToast } from '@/hooks/use-toast';

interface GoogleSheetsContextType {
  user: User | null;
  accessToken: string | null;
  spreadsheetId: string | null;
  sheetName: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  setSpreadsheetId: (id: string | null) => void;
  setSheetName: (name: string | null) => void;
}

const GoogleSheetsContext = createContext<GoogleSheetsContextType | undefined>(undefined);

export const GoogleSheetsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [spreadsheetId, setSpreadsheetIdState] = useState<string | null>(null);
  const [sheetName, setSheetNameState] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  // Load spreadsheet ID from localStorage on mount
  useEffect(() => {
    const savedId = localStorage.getItem('google_sheets_spreadsheet_id');
    const savedName = localStorage.getItem('google_sheets_sheet_name');
    if (savedId) setSpreadsheetIdState(savedId);
    if (savedName) setSheetNameState(savedName);
  }, []);

  const setSpreadsheetId = useCallback((id: string | null) => {
    setSpreadsheetIdState(id);
    if (id) {
      localStorage.setItem('google_sheets_spreadsheet_id', id);
    } else {
      localStorage.removeItem('google_sheets_spreadsheet_id');
    }
  }, []);

  const setSheetName = useCallback((name: string | null) => {
    setSheetNameState(name);
    if (name) {
      localStorage.setItem('google_sheets_sheet_name', name);
    } else {
      localStorage.removeItem('google_sheets_sheet_name');
    }
  }, []);

  useEffect(() => {
    const unsubscribe = initGoogleAuth(
      (u, token) => {
        setUser(u);
        setAccessToken(token);
      },
      () => {
        setUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const connect = async () => {
    setIsConnecting(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setAccessToken(result.accessToken);
        toast({
          title: "Conectado ao Google Sheets",
          description: "Agora você pode selecionar suas planilhas.",
        });
      }
    } catch (error) {
      console.error('Connection error:', error);
      toast({
        variant: "destructive",
        title: "Erro de conexão",
        description: "Não foi possível conectar à sua conta Google.",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = async () => {
    await logoutGoogle();
    setUser(null);
    setAccessToken(null);
    setSpreadsheetId(null);
    setSheetName(null);
    toast({
      title: "Desconectado",
      description: "Sua conta Google foi desconectada.",
    });
  };

  const value = {
    user,
    accessToken,
    spreadsheetId,
    sheetName,
    isConnected: !!user && !!accessToken,
    isConnecting,
    connect,
    disconnect,
    setSpreadsheetId,
    setSheetName,
  };

  return (
    <GoogleSheetsContext.Provider value={value}>
      {children}
    </GoogleSheetsContext.Provider>
  );
};

export const useGoogleSheets = () => {
  const context = useContext(GoogleSheetsContext);
  if (context === undefined) {
    throw new Error('useGoogleSheets must be used within a GoogleSheetsProvider');
  }
  return context;
};
