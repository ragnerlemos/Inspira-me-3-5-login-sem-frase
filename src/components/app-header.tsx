'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  FileText,
  Clapperboard,
  Feather,
  LayoutTemplate,
  Library,
  Layers,
  Menu,
  Settings,
  Star,
  User as UserIcon,
  PlusSquare,
  ChevronLeft,
  Edit,
  ChevronDown,
  CreditCard,
  Moon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { NavLink } from '@/components/ui/nav-link';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { AuthButton } from './auth-button';

// Componente para renderizar os links de navegação, agora separados por seção
function MainNavigationLinks({ onLinkClick }: { onLinkClick?: () => void }) {
  return (
    <>
      <NavLink href="/frases" icon={FileText} label="Frases" onClick={onLinkClick} />
      <NavLink href="/editor-de-video" icon={Edit} label="Editor" onClick={onLinkClick} />
      <NavLink href="/editor-de-video?batch=true" icon={Layers} label="Lote" onClick={onLinkClick} />
      <NavLink href="/favoritos" icon={Star} label="Favoritos" onClick={onLinkClick} />
      <NavLink href="/projetos" icon={Clapperboard} label="Projetos" onClick={onLinkClick} />
      <NavLink href="/modelos" icon={LayoutTemplate} label="Modelos" onClick={onLinkClick} />
      <NavLink href="/galeria" icon={Library} label="Galeria" onClick={onLinkClick} />
    </>
  );
}
function SettingsNavigationLinks({ onLinkClick }: { onLinkClick?: () => void }) {
    return (
        <>
            <NavLink href="/cadastro" icon={PlusSquare} label="Cadastro" onClick={onLinkClick} />
            <NavLink href="/perfil" icon={UserIcon} label="Central de Marca" onClick={onLinkClick} />
        </>
    )
}

function SettingsDropdown({ onLinkClick }: { onLinkClick?: () => void }) {
    const { theme, setTheme } = useTheme();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 px-2 text-muted-foreground hover:text-primary gap-1">
                    <Settings className="w-4 h-4" />
                    <span className="hidden lg:inline">Configurações</span>
                    <ChevronDown className="w-3 h-3 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 border-border bg-popover/95 backdrop-blur-md">
                <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground px-2 py-1.5">Sua Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/assinatura" onClick={onLinkClick}>
                    <DropdownMenuItem className="cursor-pointer focus:bg-primary/10">
                        <CreditCard className="w-4 h-4 mr-2" />
                        <span>Assinatura</span>
                    </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <div className="flex items-center justify-between px-2 py-1.5">
                    <div className="flex items-center gap-2">
                        <Moon className="w-4 h-4 text-muted-foreground" />
                        <Label htmlFor="dark-mode" className="text-sm cursor-pointer">Modo Escuro</Label>
                    </div>
                    <Switch 
                        id="dark-mode"
                        checked={theme === 'dark'}
                        onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                    />
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

// Cabeçalho principal da aplicação
export function AppHeader() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [showBack, setShowBack] = useState(false);

  // Efeito para determinar a visibilidade do botão "Voltar" apenas no cliente
  useEffect(() => {
    const backButtonPages = [
        '/editor-de-video',
        '/assinatura',
        '/configuracoes',
        '/perfil',
        '/projetos',
        '/modelos',
        '/galeria',
        '/favoritos',
        '/cadastro'
    ];
    setShowBack(backButtonPages.some(path => pathname.startsWith(path)));
  }, [pathname]);

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.replace('/frases');
    }
  };

  return (
    <header className="px-4 pt-4">
      {/* --- VISTA DESKTOP --- */}
      <div className="hidden md:flex items-center justify-between rounded-full bg-card p-2 shadow-sm">
        {/* Seção Esquerda: Logo e Nome */}
        <Link href="/frases" className="flex items-center gap-2 text-3xl font-headline font-bold text-[var(--theme-title-color)] pl-4">
          <Feather className="h-8 w-8 text-[var(--theme-interface-icon-color)]" />
          InspireMe
        </Link>

        {/* Seção Central: Navegação Principal */}
        <nav className="flex items-center gap-0">
          <MainNavigationLinks />
        </nav>

        {/* Seção Direita: Configurações, Perfil */}
        <div className="flex items-center gap-2 pr-2 ml-auto">
            <nav className="flex items-center gap-1">
                <SettingsNavigationLinks />
            </nav>
            <Separator orientation="vertical" className="h-8 mx-2" />
            <SettingsDropdown />
            <AuthButton />
        </div>
      </div>
      
      {/* --- VISTA MOBILE --- */}
      <div className="md:hidden flex items-center justify-between rounded-full bg-card p-2 shadow-sm h-14">
        {/* Slot Esquerdo: Ícone do Menu */}
        <div className="flex items-center justify-start w-12 flex-shrink-0">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Menu className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] p-0 flex flex-col">
                    <SheetHeader className="p-4 border-b">
                        <SheetTitle className="text-lg font-semibold">Menu</SheetTitle>
                        <SheetDescription className="sr-only">Navegação principal da aplicação</SheetDescription>
                    </SheetHeader>
                    <ScrollArea className="flex-1">
                        <nav className="flex flex-col p-4 gap-2">
                            <MainNavigationLinks onLinkClick={() => setIsSheetOpen(false)} />
                            <Separator className="my-2" />
                            <SettingsNavigationLinks onLinkClick={() => setIsSheetOpen(false)} />
                        </nav>
                    </ScrollArea>
                </SheetContent>
            </Sheet>
        </div>

        {/* Título Centralizado */}
        <Link href="/frases" className="font-headline text-lg font-bold text-center truncate flex-1 text-[var(--theme-title-color)] flex items-center justify-center gap-2">
           <Feather className="h-7 w-7 text-[var(--theme-interface-icon-color)]" />
           InspireMe
        </Link>
        
        {/* Slot Direito: Botão Voltar ou Auth */}
        <div className="flex items-center justify-end gap-2 pr-2 min-w-[48px]">
            {showBack ? (
              <Button variant="ghost" size="icon" onClick={handleBack}>
                <ChevronLeft className="h-6 w-6" />
              </Button>
            ) : (
              <>
                <SettingsDropdown />
                <AuthButton />
              </>
            )}
        </div>
      </div>
    </header>
  );
}
