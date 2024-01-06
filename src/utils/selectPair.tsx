import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PairDropdownProps {
  onPairChange: (pair: string) => void;
}

export function PairDropdown({ onPairChange }: PairDropdownProps) {
  const handleValueChange = (selectedPair: string) => {
    onPairChange(selectedPair);
  };
  return (
    <>
      <Select onValueChange={handleValueChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Pair Select..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="EURGBP">EUR/GBP</SelectItem>
          <SelectItem value="GBPUSD">GBP/USD</SelectItem>
          <SelectItem value="XAUUSD">XAU/USD</SelectItem>
        </SelectContent>
      </Select>
    </>
  );
}
