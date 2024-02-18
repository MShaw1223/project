import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/router";

interface BaseDropdownProps {
  onBasePairChange: (pair: string) => void;
}
interface QuoteDropdownProps {
  onQuotePairChange: (pair: string) => void;
}

// Call API - return array of available pairs to map
const findAvailablePairs = async (li: string): Promise<string[]> => {
  console.log("In findavailable pairs fn");
  try {
    const responseIDFH = await fetch("/api/auth/IDFromHash", {
      method: "POST",
      body: JSON.stringify(li),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const lgdin = await responseIDFH.json();
    console.log("User ID: ", lgdin);
    const responsefAP = await fetch("/api/tradeEntry/findAvailablePairs", {
      method: "POST",
      body: JSON.stringify(lgdin),
      headers: { "Content-Type": "application/json" },
    });
    const data = await responsefAP.json();
    console.log("Data: ", data);
    if (!responsefAP.ok) {
      throw new Error("Failed to fetch available pairs");
    }
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
//functions to get available pairs
function BasePairDropdown({ onBasePairChange }: BaseDropdownProps) {
  // mapped under the base pair dropdown
  const router = useRouter();
  const [availablePairs, setAvailablePairs] = useState<string[]>([]);
  useEffect(() => {
    const fetchAvailablePairs = async () => {
      try {
        const { li } = router.query;
        console.log(li);
        if (typeof li === "string") {
          const pairs = await findAvailablePairs(li);
          setAvailablePairs(pairs);
        }
      } catch (error) {
        console.error("Error fetching available pairs:", error);
      }
    };
    fetchAvailablePairs();
  }, []);

  const handleValueChange = (selectedPair: string) => {
    onBasePairChange(selectedPair);
  };
  return (
    <>
      <Select onValueChange={handleValueChange}>
        <SelectTrigger className="w-[90px]">
          <SelectValue placeholder="Base" />
        </SelectTrigger>
        <SelectContent>
          {availablePairs.map((pair, index) => (
            <SelectItem key={index} value={pair}>
              {pair}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}

function QuotePairDropdown({ onQuotePairChange }: QuoteDropdownProps) {
  //Mapped under the quote pair
  const router = useRouter();
  const [availablePairs, setAvailablePairs] = useState<string[]>([]);
  useEffect(() => {
    const fetchAvailablePairs = async () => {
      try {
        const { li } = router.query;
        if (typeof li === "string") {
          const pairs = await findAvailablePairs(li);
          setAvailablePairs(pairs);
        }
      } catch (error) {
        console.error("Error fetching available pairs:", error);
      }
    };

    fetchAvailablePairs();
  }, []);

  const handleValueChange = (selectedPair: string) => {
    onQuotePairChange(selectedPair);
  };

  return (
    <>
      <Select onValueChange={handleValueChange}>
        <SelectTrigger className="w-[90px]">
          <SelectValue placeholder="Quote" />
        </SelectTrigger>
        <SelectContent>
          {availablePairs.map((pair, index) => (
            <SelectItem key={index} value={pair}>
              {pair}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}

export { BasePairDropdown, QuotePairDropdown };
