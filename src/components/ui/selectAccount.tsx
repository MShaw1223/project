import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"

export function AccountDropdown(){
    return(
    <Select>
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
