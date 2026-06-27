
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Bold, Italic } from 'lucide-react';

interface FerramentasBasicasProps {
  text: string;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  updateState: (newState: {
    text?: string;
    fontWeight?: 'normal' | 'bold';
    fontStyle?: 'normal' | 'italic';
  }) => void;
}

export function FerramentasBasicas({
  text,
  fontWeight,
  fontStyle,
  updateState,
}: FerramentasBasicasProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="main-text">Texto</Label>
      <Textarea
        id="main-text"
        value={text}
        onChange={(e) => updateState({ text: e.target.value })}
        rows={4}
      />
      <div className="space-y-2">
        <Label>Estilo</Label>
        <div className="flex gap-2">
          <Button
            variant={fontWeight === 'bold' ? 'secondary' : 'outline'}
            onClick={() =>
              updateState({ fontWeight: fontWeight === 'bold' ? 'normal' : 'bold' })
            }
          >
            <Bold className="h-4 w-4 mr-2" />
            Negrito
          </Button>
          <Button
            variant={fontStyle === 'italic' ? 'secondary' : 'outline'}
            onClick={() =>
              updateState({
                fontStyle: fontStyle === 'italic' ? 'normal' : 'italic',
              })
            }
          >
            <Italic className="h-4 w-4 mr-2" />
            Itálico
          </Button>
        </div>
      </div>
    </div>
  );
}
