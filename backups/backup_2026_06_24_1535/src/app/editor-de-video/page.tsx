'use client';

import { Suspense } from 'react';
import Editor from './editor';
import Loading from './loading';
import { PageHeader } from '@/components/page-header';
import { ClientOnly } from '@/components/client-only';
import { EditorActions } from './components/editor-actions';
import { useEditor } from './contexts/editor-context';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';

function EditorHeaderActions() {
  const { isReady, onExportPNG, currentState } = useEditor();

  const handleShare = () => {
    if (!isReady || !currentState) return;
    // A função onExportPNG com `true` irá acionar o compartilhamento
    onExportPNG(true);
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon" onClick={handleShare} disabled={!isReady}>
        <Share2 className="h-5 w-5" />
      </Button>
      <EditorActions />
    </div>
  );
}

export default function EditorPage() {
  return (
    <div className="flex flex-col h-full">
      <ClientOnly>
        <PageHeader title="Editor" showBack>
          <EditorHeaderActions />
        </PageHeader>
      </ClientOnly>
      <div className="flex-1 flex flex-col min-h-0">
        <Suspense fallback={<Loading />}>
          <Editor />
        </Suspense>
      </div>
    </div>
  );
}
