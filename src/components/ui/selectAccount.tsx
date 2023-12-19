import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface AccountDropdownProps {
    onAccountChange: (account: string) => void;
}

export function AccountDropdown({ onAccountChange }: AccountDropdownProps) {
    const handleValueChange = (selectedAccount: string) => {
        onAccountChange(selectedAccount);
    };
    return(
    <Select onValueChange={handleValueChange} >
        <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Account Select..." />
        </SelectTrigger>
        <SelectContent>
            <SelectItem value="accountNumberOne">Account One</SelectItem>
            <SelectItem value="accountNumberTwo">Account Two</SelectItem>
            <SelectItem value="accountNumberThree">Account Three</SelectItem>
        </SelectContent>
    </Select>)
} 
