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

enum Outcomes {
  win = "win",
  loss = "loss",
  break_even = "break-even",
  no_entry = "no-entry",
}

export function OutcomeDropdown({ on_outcome_change }: winLossProps) {
  const handleValueChange = (selectedOutcome: string) => {
    on_outcome_change(selectedOutcome);
  };
  return (
    <>
      <Select onValueChange={handleValueChange}>
        <SelectTrigger className="w-32 sm:w-[200px] md:w-[250px] lg:w-[300px]">
          <SelectValue placeholder="Outcome..." />
        </SelectTrigger>
        <SelectContent>
          {Object.values(Outcomes).map((outcome) => (
            <SelectItem key={outcome} value={outcome}>
              {outcome.replace(/_/g, " ")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}
