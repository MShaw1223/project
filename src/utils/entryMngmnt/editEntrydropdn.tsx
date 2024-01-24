import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EditDropdownProps {
  onElementChange: (element: string) => void;
}

function EditDropdown({ onElementChange }: EditDropdownProps) {
  const handleValueChange = (element: string) => {
    onElementChange(element);
  };

  return (
    <>
      <Select onValueChange={handleValueChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="entryprice">Entry Price</SelectItem>
          <SelectItem value="stoploss">Stop Loss</SelectItem>
          <SelectItem value="takeprofit">Take Profit</SelectItem>
          <SelectItem value="riskratio">Risk Ratio</SelectItem>
          <SelectItem value="currencypair">Pair</SelectItem>
          <SelectItem value="account">Account</SelectItem>
          <SelectItem value="notes">Notes</SelectItem>
          <SelectItem value="outcome">Outcome</SelectItem>
        </SelectContent>
        <h1 className="p-2 text-xs text-slate-600">
          select the field you would like to edit
        </h1>
      </Select>
    </>
  );
}

export default EditDropdown;
