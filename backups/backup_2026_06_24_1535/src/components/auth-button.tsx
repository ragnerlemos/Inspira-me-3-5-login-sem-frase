'use client';

import { useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { useAuth } from '@/firebase/provider';
import { Button } from '@/components/ui/button';
import { 
  LogOut, 
  LogIn, 
  User as UserIcon,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from '@/hooks/use-toast';

export function AuthButton() {
  const auth = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginInProgress, setLoginInProgress] = useState(false);

  useEffect(() => {
    if (!auth) return;
    
    // Check for redirect result on mount
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          toast({
            title: "Login realizado",
            description: "Você entrou com sucesso via redirecionamento.",
          });
        }
      })
      .catch((error) => {
        console.error("Erro ao processar redirecionamento:", error);
      });

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const handleLogin = async () => {
    if (loginInProgress) return;
    setLoginInProgress(true);
    
    try {
      const provider = new GoogleAuthProvider();
      // Try popup first
      await signInWithPopup(auth, provider);
      toast({
        title: "Login realizado",
        description: "Você entrou com sucesso usando sua conta Google.",
      });
    } catch (error: any) {
      console.error("Erro ao fazer login com popup:", error);
      
      // If popup fails (blocked or cross-origin), try redirect
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
         toast({
          title: "Popup bloqueado ou fechado",
          description: "Tentando via redirecionamento...",
        });
      }
      
      try {
        const provider = new GoogleAuthProvider();
        await signInWithRedirect(auth, provider);
      } catch (redirectError: any) {
        console.error("Erro ao fazer login com redirecionamento:", redirectError);
        toast({
          title: "Erro no login",
          description: "Não foi possível entrar com sua conta Google.",
          variant: "destructive",
        });
      }
    } finally {
      setLoginInProgress(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Sessão encerrada",
        description: "Você saiu da sua conta.",
      });
    } catch (error: any) {
      console.error("Erro ao sair:", error);
    }
  };

  if (loading) {
    return (
      <Button variant="outline" size="sm" disabled className="rounded-full">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        Carregando...
      </Button>
    );
  }

  if (!user) {
    return (
      <Button 
        onClick={handleLogin} 
        variant="outline" 
        size="sm" 
        disabled={loginInProgress}
        className="gap-2 rounded-full font-medium"
      >
        {loginInProgress ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <LogIn className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">Entrar com Google</span>
        <span className="sm:hidden">Entrar</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
            <AvatarFallback>
              <UserIcon className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
