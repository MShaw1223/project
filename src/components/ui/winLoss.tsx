import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface winLossProps {
  on_outcome_change: (outcome: string) => void;
}

export function OutcomeDropdown({ on_outcome_change }: winLossProps) {
  const handleValueChange = (selectedOutcome: string) => {
    on_outcome_change(selectedOutcome);
  };
  return (
    <>
      <Select onValueChange={handleValueChange}>
        <SelectTrigger className="w-[419px]">
          <SelectValue placeholder="Outcome Select..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="w">WIN</SelectItem>
          <SelectItem value="l">LOSS</SelectItem>
        </SelectContent>
      </Select>
    </>
  );
}
