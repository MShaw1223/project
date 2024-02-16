import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/router";
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
  const router = useRouter();
  const { li } = router.query;
  console.log(li);
  if (li !== undefined) {
    try {
      const user = await fetch("/api/auth/userFromHash", {
        method: "POST",
        body: JSON.stringify(li),
        headers: { "Content-Type": "application/json" },
      });
      const lgdin = await user.json();
      console.log("logged in: ", lgdin);
      const username = lgdin.loggedIn;
      const response = await fetch("/api/findAccounts", {
        method: "POST",
        body: username,
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
  }
};

function AccountDropdown({ onAccountChange }: AccountDropdownProps) {
  const [availableAccounts, setAvailableAccounts] = useState<string[]>([]);
  async function fetchAvailablePairs() {
    try {
      //API function to get available pairs
      const account = await findAvailableAccounts();
      setAvailableAccounts(account);
    } catch (error) {
      console.error("Error fetching available accounts:", error);
    }
  }
  fetchAvailablePairs();

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
