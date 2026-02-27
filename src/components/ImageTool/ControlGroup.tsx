import { Label } from "../ui/label";
import { Slider } from "../ui/slider";

interface ControlGroupProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  description?: string;
}

export default function ControlGroup({
  label,
  value,
  min,
  max,
  onChange,
  description,
}: ControlGroupProps) {
  return (
    <div className="space-y-3 group">
      <div className="flex justify-between items-end">
        <div className="flex flex-col">
          <Label className="text-xs font-bold tracking-tight mb-0.5">
            {label}
          </Label>
          {description && (
            <span className="text-[9px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-tighter">
              {description}
            </span>
          )}
        </div>
        <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
          {value > 0 ? `+${value}` : value}
        </span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={1}
        onValueChange={(vals) => onChange(vals[0])}
        className="cursor-pointer"
      />
    </div>
  );
}