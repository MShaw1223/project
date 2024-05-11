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
        <SelectTrigger className="w-32 sm:w-[200px] md:w-[250px] lg:w-[300px]">
          <SelectValue placeholder="Outcome" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="win">Win</SelectItem>
          <SelectItem value="loss">Loss</SelectItem>
          <SelectItem value="break-even">Break Even</SelectItem>
          <SelectItem value="no-entry">No Entry</SelectItem>
        </SelectContent>
      </Select>
    </>
  );
}
