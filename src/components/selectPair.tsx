import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/router";
import { DropdownProps } from "@/utils/helpful";

interface BaseDropdownProps extends DropdownProps {}

interface QuoteDropdownProps extends DropdownProps {}

// Call API - return array of available pairs to map
const findAvailablePairs = async (li: string) => {
  try {
    const responseIDFH = await fetch("/api/auth/IDFromHash", {
      method: "POST",
      body: JSON.stringify(li),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const lgdin = await responseIDFH.json();
    const responsefAP = await fetch("/api/findAvailablePairs", {
      method: "POST",
      body: JSON.stringify(lgdin),
      headers: { "Content-Type": "application/json" },
    });
    const data: string[] = await responsefAP.json();
    if (!responsefAP.ok) {
      alert("Failed to fetch available pairs");
    }
    if (!Array.isArray(data)) {
      alert("Invalid API response format");
    }
    return data;
  } catch (error) {
    alert(error);
  }
};
//functions to get available pairs
function BasePairDropdown({ onPairChange: onPairChange }: BaseDropdownProps) {
  // mapped under the base pair dropdown
  const router = useRouter();
  const [availablePairs, setAvailablePairs] = useState<string[]>([]);
  useEffect(() => {
    const fetchAvailablePairs = async () => {
      try {
        const { li } = router.query;
        if (typeof li === "string") {
          const pairs = await findAvailablePairs(li);
          setAvailablePairs(pairs!);
        }
      } catch (error) {
        alert(error);
      }
    };
    fetchAvailablePairs();
  }, []);

  const handleValueChange = (selectedPair: string) => {
    onPairChange(selectedPair);
  };
  return (
    <>
      <Select onValueChange={handleValueChange}>
        <SelectTrigger className="w-20 sm:w-[86px] md:w-[115px] lg:w-[140px]">
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

function QuotePairDropdown({ onPairChange: onPairChange }: QuoteDropdownProps) {
  //Mapped under the quote pair
  const router = useRouter();
  const [availablePairs, setAvailablePairs] = useState<string[]>([]);
  useEffect(() => {
    const fetchAvailablePairs = async () => {
      try {
        const { li } = router.query;
        if (typeof li === "string") {
          const pairs = await findAvailablePairs(li);
          setAvailablePairs(pairs!);
        }
      } catch (error) {
        throw error;
      }
    };

    fetchAvailablePairs();
  }, []);

  const handleValueChange = (selectedPair: string) => {
    onPairChange(selectedPair);
  };

  return (
    <>
      <Select onValueChange={handleValueChange}>
        <SelectTrigger className="w-20 p-2 sm:w-[86px] md:w-[115px] lg:w-[140px]">
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
function PairDropdown({ onPairChange }: DropdownProps) {
  //Mapped under the quote pair
  const router = useRouter();
  const [availablePairs, setAvailablePairs] = useState<string[]>([]);
  useEffect(() => {
    const fetchAvailablePairs = async () => {
      try {
        const { li } = router.query;
        if (typeof li === "string") {
          const pairs = await findAvailablePairs(li);
          setAvailablePairs(pairs!);
        }
      } catch (error) {
        throw error;
      }
    };

    fetchAvailablePairs();
  }, []);

  const handleValueChange = (selectedPair: string) => {
    onPairChange(selectedPair);
  };

  return (
    <>
      <Select onValueChange={handleValueChange}>
        <SelectTrigger className="w-56 sm:w-[275px] md:w-[300px] lg:w-[350px]">
          <SelectValue placeholder="Select Pair" />
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

export { BasePairDropdown, QuotePairDropdown, PairDropdown };
