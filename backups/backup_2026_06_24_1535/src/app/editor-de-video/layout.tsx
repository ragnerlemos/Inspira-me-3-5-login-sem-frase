'use client';

import { EditorProvider } from './contexts/editor-context';
import { FirebaseClientProvider } from '@/firebase';
import { useGoogleFonts } from '@/hooks/use-google-fonts';

// Layout específico para a página do editor, que não possui o cabeçalho principal.
export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useGoogleFonts();
  return (
    <FirebaseClientProvider>
      <EditorProvider>{children}</EditorProvider>
    </FirebaseClientProvider>
  );
}
