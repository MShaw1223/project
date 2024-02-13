import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { useEffect, useState } from "react";

interface AccountDropdownProps {
  onAccountChange: (account: string) => void;
}

const findAvailableAccounts = async (): Promise<string[]> => {
  try {
    const response = await ApiCall();
    console.log("API RESPONSE: ", response);
    if (Array.isArray(response)) {
      console.log(response);
      return response;
    } else {
      throw new Error("Invalid API response format");
    }
  } catch (error) {
    console.error("Error in API call:", error);
    throw error;
  }
};
const ApiCall = async () => {
  try {
    const response = await fetch("/api/findAccounts", {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch available accounts");
    }
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error("Error in API call:", error);
    throw error;
  }
};

function AccountDropdown({ onAccountChange }: AccountDropdownProps) {
  const [availableAccounts, setAvailableAccounts] = useState<string[]>([]);
  useEffect(() => {
    const fetchAvailablePairs = async () => {
      try {
        //API function to get available pairs
        const account = await findAvailableAccounts();
        setAvailableAccounts(account);
      } catch (error) {
        console.error("Error fetching available accounts:", error);
      }
    };
    fetchAvailablePairs();
  }, []);

  const handleValueChange = (selectedAcc: string) => {
    onAccountChange(selectedAcc);
  };
  return (
    <>
      <Select onValueChange={handleValueChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Account Select..." />
        </SelectTrigger>
        <SelectContent>
          {availableAccounts.map((account, index) => (
            <SelectItem key={index} value={account}>
              {account}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}
export default AccountDropdown;
