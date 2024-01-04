import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface usersDropdnProps {
  onChoiceChange: (choice: string) => void;
}

const DropdownChoice = ({ onChoiceChange }: usersDropdnProps) => {
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
          <SelectItem value="create">Create a new User</SelectItem>
          <SelectItem value="edit">Edit an existing User</SelectItem>
          <SelectItem value="delete">Delete an existing User</SelectItem>
        </SelectContent>
      </Select>
    </>
  );
};

export default DropdownChoice;
