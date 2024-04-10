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

function AccountDropdown({ onAccountChange }: AccountDropdownProps) {
  const router = useRouter();
  const [availableAccounts, setAvailableAccounts] = useState<string[]>([]);
  useEffect(() => {
    const fetchAvailableAccs = async () => {
      const { li: loggedInVal } = router.query;
      if (typeof loggedInVal === "string") {
        const id = await fetch("/api/auth/IDFromHash", {
          method: "POST",
          body: JSON.stringify(loggedInVal),
          headers: { "Content-Type": "application/json" },
        });
        const lgdin = await id.json();
        const response = await fetch("/api/findAccounts", {
          method: "POST",
          body: JSON.stringify(lgdin),
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error("Failed to fetch available accounts");
        }
        const data = await response.json();
        if (data !== undefined) {
          setAvailableAccounts(data);
        }
      } else {
        throw new Error("Invalid URL format");
      }
    };
    fetchAvailableAccs();
  }, []);
  const handleValueChange = async (selectedAcc: string) => {
    onAccountChange(selectedAcc);
  };
  return (
    <>
      <Select onValueChange={handleValueChange}>
        <SelectTrigger className="w-32 sm:w-[200px] md:w-[250px] lg:w-[300px]">
          <SelectValue placeholder="Account..." />
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
