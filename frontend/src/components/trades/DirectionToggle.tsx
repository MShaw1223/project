import { TrendingDown, TrendingUp } from "lucide-react";
import { TradeDirection } from "@/lib/trades";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "long", label: "Long", icon: TrendingUp },
  { value: "short", label: "Short", icon: TrendingDown },
] as const;

interface DirectionToggleProps {
  id?: string;
  value: TradeDirection | "";
  onChange: (direction: TradeDirection) => void;
}

// two-option segmented control, sized to match the neighbouring inputs
export function DirectionToggle({ id, value, onChange }: DirectionToggleProps) {
  return (
    <div id={id} role="radiogroup" aria-label="Direction" className="grid h-10 grid-cols-2 gap-1 rounded-md border border-input bg-background p-1">
      {OPTIONS.map(({ value: option, label, icon: Icon }) => {
        const selected = value === option;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option)}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-sm text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring",
              selected && "bg-secondary text-foreground shadow-xs"
            )}
          >
            <Icon className="size-4" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
