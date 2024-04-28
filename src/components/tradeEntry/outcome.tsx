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

enum outcomesValues {
  win = "win",
  loss = "loss",
  break_even = "break-even",
  no_entry = "no-entry",
}
enum outcomesDisplays {
  win = "Win",
  loss = "Loss",
  break_even = "Break Even",
  no_entry = "No Entry",
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
          <SelectItem value={outcomesValues.win}>
            {outcomesDisplays.win}
          </SelectItem>
          <SelectItem value={outcomesValues.loss}>
            {outcomesDisplays.loss}
          </SelectItem>
          <SelectItem value={outcomesValues.break_even}>
            {outcomesDisplays.break_even}
          </SelectItem>
          <SelectItem value={outcomesValues.no_entry}>
            {outcomesDisplays.no_entry}
          </SelectItem>
        </SelectContent>
      </Select>
    </>
  );
}
