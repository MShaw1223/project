import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface entryMntDropdnProps {
  onChoiceChange: (choice: string) => void;
}

const EntryMntDropdown = ({ onChoiceChange }: entryMntDropdnProps) => {
  const handleValueChange = (selectedChoice: string) => {
    onChoiceChange(selectedChoice);
  };
  return (
    <>
      <Select onValueChange={handleValueChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="search">Search for an Entry</SelectItem>
          <SelectItem value="edit">Edit an Entry</SelectItem>
          <SelectItem value="delete">Delete an Entry</SelectItem>
        </SelectContent>
      </Select>
    </>
  );
};

export default EntryMntDropdown;
