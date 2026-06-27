
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface FerramentaEmojisProps {
  applyEffectsToEmojis: boolean;
  updateState: (newState: { applyEffectsToEmojis?: boolean }) => void;
}

export function FerramentaEmojis({
  applyEffectsToEmojis,
  updateState,
}: FerramentaEmojisProps) {
  return (
    <div className="space-y-4 border-t pt-4">
      <h3 className="font-semibold">Emojis</h3>
      <div className="flex items-center justify-between">
        <Label htmlFor="emoji-effects" className="cursor-pointer">
          Aplicar efeitos a emojis
        </Label>
        <Switch
          id="emoji-effects"
          checked={applyEffectsToEmojis}
          onCheckedChange={(checked) =>
            updateState({ applyEffectsToEmojis: checked })
          }
        />
      </div>
    </div>
  );
}
