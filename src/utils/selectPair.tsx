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
          <SelectValue placeholder="Account Select..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="accountNumberOne">Account One</SelectItem>
          <SelectItem value="accountNumberTwo">Account Two</SelectItem>
          <SelectItem value="accountNumberThree">Account Three</SelectItem>
        </SelectContent>
      </Select>
    </>
  );
}
