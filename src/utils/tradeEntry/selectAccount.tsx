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

const findAvailableAccounts = async (
  li: string
): Promise<string[] | undefined> => {
  try {
    const user = await fetch("/api/auth/userFromHash", {
      method: "POST",
      body: JSON.stringify(li),
      headers: { "Content-Type": "application/json" },
    });
    const lgdin = await user.json();
    const response = await fetch("/api/findAccounts", {
      method: "POST",
      body: lgdin,
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch available accounts");
    }
    const data = await response.json();
    if (Array.isArray(data)) {
      return data;
    } else {
      throw new Error("Invalid API response format");
    }
  } catch (error) {
    console.error("Error in API call:", error);
    throw error;
  }
};

function AccountDropdown({ onAccountChange }: AccountDropdownProps) {
  const router = useRouter();
  const [availableAccounts, setAvailableAccounts] = useState<string[]>([]);
  useEffect(() => {
    const fetchAvailableAccs = async () => {
      try {
        const { li } = router.query;
        if (typeof li === "string") {
          const account = await findAvailableAccounts(li);
          if (account !== undefined) {
            setAvailableAccounts(account);
          }
        }
      } catch (error) {
        console.error("Error fetching available accounts:", error);
      }
    };
    fetchAvailableAccs();
  }, [router.query]);
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
