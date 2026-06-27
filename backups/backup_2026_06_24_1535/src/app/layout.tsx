import { Providers } from "./providers";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { GoogleSheetsProvider } from "@/components/google-sheets/google-sheets-provider";
import "./globals.css";

// Este é o Layout Raiz. Ele aplica estilos globais e provedores de tema.
// Ele deve ser um Componente de Servidor e conter apenas o essencial.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className="dark h-full">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
      </head>
      <body className="font-body antialiased h-full">
        <FirebaseClientProvider>
          <Providers>
            <GoogleSheetsProvider>
              {children}
            </GoogleSheetsProvider>
          </Providers>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
