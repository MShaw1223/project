import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FieldDropdownProps {
  onFieldChange: (field: string) => void;
}

function SelectEdit({ onFieldChange }: FieldDropdownProps) {
  const handleValueChange = async (selected: string) => {
    onFieldChange(selected);
  };
  return (
    <>
      <Select onValueChange={handleValueChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Field Select..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="username">Username</SelectItem>
          <SelectItem value="passwd">Password</SelectItem>
        </SelectContent>
      </Select>
    </>
  );
}

export default SelectEdit;
