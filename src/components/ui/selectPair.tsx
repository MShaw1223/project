import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BaseDropdownProps {
  onBasePairChange: (pair: string) => void;
}
interface QuoteDropdownProps {
  onQuotePairChange: (pair: string) => void;
}
interface PairRow {
  pairabbr: string;
}

function BasePairDropdown({ onBasePairChange }: BaseDropdownProps) {
  const [availablePairs, setAvailablePairs] = useState<string[]>([]);
  useEffect(() => {
    const fetchAvailablePairs = async () => {
      try {
        //API function to get available pairs
        const pairs = await findAvailablePairs();
        setAvailablePairs(pairs);
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
  const [availablePairs, setAvailablePairs] = useState<string[]>([]);
  useEffect(() => {
    const fetchAvailablePairs = async () => {
      try {
        //API function to get available pairs
        const pairs = await findAvailablePairs();
        setAvailablePairs(pairs);
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

// Call API - return array of available pairs
const findAvailablePairs = async (): Promise<string[]> => {
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
    const response = await fetch("/api/findAvailablePairs", {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch available pairs");
    }
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error("Error in API call:", error);
    throw error;
  }
};
export { BasePairDropdown, QuotePairDropdown };
