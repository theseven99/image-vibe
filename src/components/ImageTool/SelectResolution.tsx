import { cn } from '@/lib/utils';
import { Maximize2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';

type Props = {
  onChangeDimensionOption: (id: string) => void;
  dimensionOption: string;

  customWidth?: number;
  customHeight?: number;
  onchangeCustomWidth?: (amount: number) => void;
  onchangeCustomHeight?: (amount: number) => void;
};

export default function SelectResolution({
  dimensionOption,
  onChangeDimensionOption,

  customHeight,
  customWidth,
  onchangeCustomWidth,
  onchangeCustomHeight,
}: Props) {
  return (
    <div className="pt-6 border-t border-zinc-100 dark:border-white/5 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Maximize2 className="w-4 h-4 text-blue-600" />
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
          Output Resolution
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {[
          { id: 'none', label: 'Native' },
          { id: '720p', label: '720p HD' },
          { id: '1080p', label: '1080p FHD' },
          { id: 'custom', label: 'Custom' },
        ].map((opt) => (
          <Button
            key={opt.id}
            onClick={() => onChangeDimensionOption(opt.id)}
            className={cn(
              'px-3 py-2 text-[10px] font-bold uppercase tracking-wider border rounded-lg transition-all',
              dimensionOption === opt.id
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 border-zinc-900 dark:border-white shadow-sm'
                : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-700',
            )}
          >
            {opt.label}
          </Button>
        ))}
      </div>

      {dimensionOption === 'custom' && (
        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
          <div className="space-y-1">
            <Label className="text-[10px] uppercase font-bold text-zinc-400">
              Width
            </Label>
            <input
              type="number"
              value={customWidth || 0}
              onChange={(e) => onchangeCustomWidth?.(Number(e.target.value))}
              className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-white/10 rounded-lg px-2 py-1.5 font-mono text-xs text-center focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] uppercase font-bold text-zinc-400">
              Height
            </Label>
            <input
              type="number"
              value={customHeight || 0}
              onChange={(e) => onchangeCustomHeight?.(Number(e.target.value))}
              className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-white/10 rounded-lg px-2 py-1.5 font-mono text-xs text-center focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
