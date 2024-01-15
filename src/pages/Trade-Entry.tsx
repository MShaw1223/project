import AccountDropdown from "@/utils/selectAccount";
import { Button } from "@/components/ui/button";
import { useMutation } from "react-query";
import { useState, FormEvent } from "react";
import { NextPage } from "next";
import Menu from "@/components/ui/menu";
import { BsFillJournalBookmarkFill } from "react-icons/bs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  BasePairDropdown,
  QuotePairDropdown,
} from "@/components/ui/selectPair";
import { OutcomeDropdown } from "@/components/ui/winLoss";

const tradeEntry: NextPage = () => {
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [selectedBasePair, setSelectedBasePair] = useState<string>("");
  const [selectedQuotePair, setSelectedQuotePair] = useState<string>("");
  const [selectedOutcome, setSelectedOutcome] = useState<string>("");

  const mutation = useMutation({
    mutationFn: async (formData: string) => {
      const response = await fetch("/api/entries", {
        method: "POST",
        body: formData,
        cache: "no-cache",
      });
      if (!response.ok) {
        throw new Error("Failed to submit trade data");
      }

      return response.json();
    },
    onSettled: () => {
      // Reset any state related to the mutation
      setSelectedAccount("");
      setSelectedBasePair("");
      setSelectedQuotePair("");
      setSelectedOutcome("");
    },
    onError: (error) => {
      console.error("Mutation error:", error);
    },
  });

  const handleAccountChange = (selectedAccount: string) => {
    setSelectedAccount(selectedAccount);
  };
  const handleBasePairChange = (selectedBasePair: string) => {
    setSelectedBasePair(selectedBasePair);
  };
  const handleQuotePairChange = (selectedQuotePair: string) => {
    setSelectedQuotePair(selectedQuotePair);
  };
  const handleOutcomeChange = (selectedOutcome: string) => {
    setSelectedOutcome(selectedOutcome);
  };

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData(event.target as HTMLFormElement);
    const entryPrice = parseFloat(data.get("entryPrice") as string);
    const stopLoss = parseFloat(data.get("stopLoss") as string);
    const takeProfit = parseFloat(data.get("takeProfit") as string);
    const selectedAccountValue = selectedAccount;
    const riskRatio = parseFloat(data.get("riskRatio") as string);
    const currencyPair = selectedBasePair + selectedQuotePair;
    const tradeNotes = data.get("tradeNotes");
    const winOrLoss = selectedOutcome;

    if (
      !entryPrice ||
      !stopLoss ||
      !takeProfit ||
      !riskRatio ||
      currencyPair === "" ||
      selectedAccountValue === "" ||
      tradeNotes === "" ||
      selectedOutcome === "" ||
      selectedBasePair === selectedQuotePair
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
      selectedPair: currencyPair,
      tradeNotes,
      selectedOutcome: winOrLoss,
    });

    mutation.mutate(dataPackage);
  }

  return (
    //
    //
    <>
      <div className="flex h-screen bg-slate-200">
        <Menu />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex p-3 text-3xl">
            <BsFillJournalBookmarkFill className="h-10 w-10"></BsFillJournalBookmarkFill>
            <span className="ml-4 my-auto font-bold">Trade Entry</span>
          </div>
          <div className="w-full overflow-auto p-5 mt-8">
            <div>
              {mutation.isLoading && <p>Submitting Trade Data...</p>}
              {!mutation.isLoading && (
                <div className="flex">
                  <div className="flex flex-col items-center w-4/5">
                    <form onSubmit={handleSubmit}>
                      <div className="flex">
                        <div className="flex flex-col">
                          <div className="p-3">
                            <AccountDropdown
                              onAccountChange={handleAccountChange}
                            ></AccountDropdown>
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <div className="p-3 w-full">
                            <OutcomeDropdown
                              on_outcome_change={handleOutcomeChange}
                            ></OutcomeDropdown>
                          </div>
                          <div className="flex">
                            <div className="flex flex-col">
                              <div className="p-3">
                                <Input
                                  id="entryPrice"
                                  name="entryPrice"
                                  type="number"
                                  step="any"
                                  placeholder="Entry Price..."
                                ></Input>
                              </div>
                              <div className="p-3">
                                <Input
                                  id="stopLoss"
                                  name="stopLoss"
                                  type="number"
                                  step="any"
                                  placeholder="Stop Loss..."
                                ></Input>
                              </div>
                              <div className="p-3">
                                <Input
                                  id="takeProfit"
                                  name="takeProfit"
                                  type="number"
                                  step="any"
                                  placeholder="Take Profit..."
                                ></Input>
                              </div>
                              <div className="p-3 flex flex-row">
                                <div className="p-1">
                                  <BasePairDropdown
                                    onBasePairChange={handleBasePairChange}
                                  ></BasePairDropdown>
                                </div>
                                <div className="p-1">
                                  <QuotePairDropdown
                                    onQuotePairChange={handleQuotePairChange}
                                  ></QuotePairDropdown>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <div className="p-3">
                                <Input
                                  id="riskRatio"
                                  name="riskRatio"
                                  type="number"
                                  step="any"
                                  placeholder="Risk Ratio..."
                                ></Input>
                              </div>
                              <div className="flex flex-col">
                                <div className="p-3">
                                  <Textarea
                                    id="tradeNotes"
                                    name="tradeNotes"
                                    placeholder="Notes..."
                                    className="w-full h-[180px] resize-none border border-slate-200 text-sm"
                                    maxLength={1250}
                                  ></Textarea>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="p-3 text-center">
                            <Button type="submit">Submit Entry</Button>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default tradeEntry;
