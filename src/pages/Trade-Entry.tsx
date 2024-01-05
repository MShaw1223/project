import { AccountDropdown } from "@/utils/selectAccount";
import { Button } from "@/components/ui/button";
import { useMutation } from "react-query";
import { useState, FormEvent } from "react";
import { NextPage } from "next";
import Menu from "@/utils/menu";
import { BsFillJournalBookmarkFill } from "react-icons/bs";
import { Separator } from "@/components/ui/separator";
import TEFormInputs from "@/utils/TradeEntryFormInputs";
import { PairDropdown } from "@/utils/selectPair";

const tradeEntry: NextPage = () => {
  const [selectedAccount, setSelectedAccount, selectedPair, setSelectedPair] =
    useState<string>("");

  const mutation = useMutation({
    mutationFn: async (formData: string) => {
      const response = await fetch("/api/entries", {
        method: "POST",
        body: formData,
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error("Failed to submit trade data");
      }

      return response.json();
    },
    onSettled: () => {
      // Reset any state related to the mutation
      setSelectedAccount("");
      setSelectedPair("");
    },
    onError: (error) => {
      console.error("Mutation error:", error);
    },
  });

  const handleAccountChange = (selectedAccount: string) => {
    setSelectedAccount(selectedAccount);
  };
  const handlePairChange = (selectedPair: string) => {
    setSelectedPair(selectedPair);
  };

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData(event.target as HTMLFormElement);
    const entryPrice = parseFloat(data.get("entryPrice") as string);
    const stopLoss = parseFloat(data.get("stopLoss") as string);
    const takeProfit = parseFloat(data.get("takeProfit") as string);
    const selectedAccountValue = selectedAccount;
    const riskRatio = parseFloat(data.get("riskRatio") as string);
    const currencyPairChoice = selectedPair;
    const tradeNotes = data.get("tradeNotes");

    if (
      !entryPrice ||
      !stopLoss ||
      !takeProfit ||
      !riskRatio ||
      currencyPairChoice === "" ||
      selectedAccountValue === "" ||
      tradeNotes === ""
    ) {
      alert("Invalid entry");
      return;
    }
    const dataPackage = JSON.stringify({
      entryPrice,
      stopLoss,
      takeProfit,
      selectedAccount: selectedAccountValue,
      riskRatio,
      selectedPair: currencyPairChoice,
      tradeNotes,
    });

    mutation.mutate(dataPackage);
  }

  return (
    <>
      <div className="flex h-screen">
        <Menu />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex p-3 text-3xl">
            <BsFillJournalBookmarkFill className="h-10 w-10"></BsFillJournalBookmarkFill>
            <span className="ml-4 my-auto font-sans font-bold">
              Trade Entry
            </span>
          </div>
          <div className="flex-1 overflow-auto p-5 mt-8">
            <div className="flex">
              <div className="w-3/12 flex flex-col">
                <AccountDropdown
                  onAccountChange={handleAccountChange}
                ></AccountDropdown>
              </div>
              <Separator orientation="vertical" />
              <div className="w-9/12 flex flex-col text-center">
                {mutation.isLoading && <p>Submitting Trade Data...</p>}
                {!mutation.isLoading && (
                  <div className="flex flex-col items-center">
                    <form onSubmit={handleSubmit}>
                      <TEFormInputs />

                      <PairDropdown
                        onPairChange={handlePairChange}
                      ></PairDropdown>
                      <div className="p-3">
                        <Button type="submit">Submit Entry</Button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default tradeEntry;
