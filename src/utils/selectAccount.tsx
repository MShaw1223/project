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
  onAccountChange: (account: { id: number; name: string }) => void;
}

function AccountDropdown({ onAccountChange }: AccountDropdownProps) {
  const router = useRouter();
  const [availableAccounts, setAvailableAccounts] = useState<
    { id: number; name: string }[]
  >([]);
  useEffect(() => {
    const fetchAvailableAccs = async () => {
      try {
        const { li } = router.query;
        if (typeof li === "string") {
          const id = await fetch("/api/auth/IDFromHash", {
            body: JSON.stringify(li),
            method: "POST",
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
            console.log("Data in selAcc: ", data);
            setAvailableAccounts(data);
          }
        } else {
          throw new Error("Invalid URL format");
        }
      } catch (error) {
        console.error("Error fetching available accounts:", error);
      }
    };
    fetchAvailableAccs();
  }, [router.query]);
  const handleValueChange = async (selectedAcc: {
    id: number;
    name: string;
  }) => {
    onAccountChange(selectedAcc);
  };
  return (
    <>
      <Select onValueChange={handleValueChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Account Select..." />
        </SelectTrigger>
        <SelectContent>
          {availableAccounts.map((account) => (
            <SelectItem key={account.id} value={account.name}>
              {account.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}
export default AccountDropdown;
