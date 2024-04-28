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

enum outcomes {
  win = { display: "Win", value: "win" },
  loss = { display: "Loss", value: "loss" },
  break_even = { display: "Break Even", value: "break-even" },
  no_entry = { display: "No Entry", value: "no-entry" },
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
          <SelectItem value={outcomes.win.value}>
            {outcomes.win.display}
          </SelectItem>
          <SelectItem value={outcomes.loss.value}>
            {outcomes.loss.display}
          </SelectItem>
          <SelectItem value={outcomes.break_even.value}>
            {outcomes.break_even.display}
          </SelectItem>
          <SelectItem value={outcomes.no_entry.value}>
            {outcomes.no_entry.display}
          </SelectItem>
        </SelectContent>
      </Select>
    </>
  );
}
