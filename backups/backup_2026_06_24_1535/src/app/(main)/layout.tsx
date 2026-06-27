'use client';

import { AppHeader } from '@/components/app-header';
import { FirebaseClientProvider } from '@/firebase';
import { useBackButton } from '@/hooks/use-back-button';
import { useGoogleFonts } from '@/hooks/use-google-fonts';
import { usePathname } from 'next/navigation';

// Componente de layout principal para as páginas do aplicativo.
// Ele controla a exibição do cabeçalho e envolve o conteúdo com os provedores necessários.
export default function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Carrega as fontes do Google para uso em toda a aplicação.
  useGoogleFonts();
  // Ativa a lógica do botão de voltar nativo
  useBackButton();

  // Rotas que não devem mostrar o cabeçalho principal
  const noHeaderPaths = ['/editor-de-video'];
  const hideHeader = noHeaderPaths.some((path) => pathname.startsWith(path));

  return (
    <FirebaseClientProvider>
      <div className="flex flex-col h-full bg-background">
        {!hideHeader && <AppHeader />}
        <div className="flex-1 flex flex-col min-h-0">{children}</div>
      </div>
    </FirebaseClientProvider>
  );
}
