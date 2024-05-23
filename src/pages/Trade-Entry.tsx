import AccountDropdown from "@/components/selectAccount";
import { Button } from "@/components/ui/button";
import { useMutation } from "react-query";
import * as React from "react";
import { NextPage } from "next";
import { FaPencilAlt } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BasePairDropdown, QuotePairDropdown } from "@/components/selectPair";
import { OutcomeDropdown } from "@/components/tradeEntry/outcome";
import withAuth from "@/components/authorise";

const tradeEntry: NextPage = () => {
  const [selectedAccount, setSelectedAccount] = React.useState<string>("");
  const [selectedBasePair, setSelectedBasePair] = React.useState<string>("");
  const [selectedQuotePair, setSelectedQuotePair] = React.useState<string>("");
  const [selectedOutcome, setSelectedOutcome] = React.useState<string>("");
  const mutation = useMutation({
    mutationFn: async (formData: string) => {
      const response = await fetch("/api/tradeEntry", {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });
      if (!response.ok) {
        alert("Failed to submit trade data");
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
    onError: () => {
      alert("Program error");
      return;
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

  async function getID(selectedAccount: string) {
    const acctID = await fetch("/api/findActID", {
      method: "POST",
      body: JSON.stringify(selectedAccount),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const lgdin = await acctID.json();
    return lgdin;
  }
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.target as HTMLFormElement);
    if (!selectedBasePair || !selectedQuotePair || !selectedOutcome) {
      alert("Please select base pair, quote pair, and outcome.");
      return;
    }
    if (selectedBasePair === selectedQuotePair) {
      alert("Please select different base and quote pairs.");
      return;
    }
    const accountID = await getID(selectedAccount);
    function riskCalculation(
      entry: number,
      stop: number,
      profit: number
    ): number {
      var risk: number = entry - stop;
      var reward: number = profit - entry;
      var riskratio: number = reward / risk;
      return riskratio;
    }
    try {
      mutation.mutate(
        JSON.stringify({
          accountID: accountID,
          selectedPair: selectedBasePair + selectedQuotePair,
          entryPrice: parseFloat(data.get("entryPrice") as string),
          riskRatio: riskCalculation(
            parseFloat(data.get("entryPrice") as string),
            parseFloat(data.get("stopLoss") as string),
            parseFloat(data.get("takeProfit") as string)
          ),
          stopLoss: parseFloat(data.get("stopLoss") as string),
          takeProfit: parseFloat(data.get("takeProfit") as string),
          tradeNotes: data.get("tradeNotes"),
          selectedOutcome: selectedOutcome,
        })
      );
    } catch (error) {
      alert("Error Submitting Trade");
    }
  }
  return (
    <>
      <div className="flex h-screen bg-slate-200">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex p-3 text-3xl justify-center">
            <FaPencilAlt className="h-10 w-10"></FaPencilAlt>
            <span className="ml-4 my-auto font-bold">Trade Entry</span>
          </div>
          <div className="flex p-2 sm:my-auto md:my-auto lg:my-auto justify-center items-center">
            {mutation.isLoading && <p>Submitting Trade Data...</p>}
            {!mutation.isLoading && (
              <form onSubmit={handleSubmit} className="mx-auto">
                <div className="flex">
                  <div className="flex flex-col">
                    <div className="p-1 sm:p-2 md:p-3 lg:p-5">
                      <AccountDropdown
                        onAccountChange={handleAccountChange}
                      ></AccountDropdown>
                    </div>
                    <div className="p-1 sm:p-2 md:p-3 lg:p-5">
                      <OutcomeDropdown
                        on_outcome_change={handleOutcomeChange}
                      ></OutcomeDropdown>
                    </div>
                    <div className="p-1 sm:p-2 md:p-3 lg:p-5">
                      <Input
                        id="entryPrice"
                        name="entryPrice"
                        type="number"
                        step="any"
                        placeholder="Entry Price..."
                        className="w-32 sm:w-[200px] md:w-[250px] lg:w-[300px]"
                      ></Input>
                    </div>
                    <div className="p-1 sm:p-2 md:p-3 lg:p-5">
                      <Input
                        id="stopLoss"
                        name="stopLoss"
                        type="number"
                        step="any"
                        placeholder="Stop Loss..."
                        className="w-32 sm:w-[200px] md:w-[250px] lg:w-[300px]"
                      ></Input>
                    </div>
                    <div className="p-1 sm:p-2 md:p-3 lg:p-5">
                      <Input
                        id="takeProfit"
                        name="takeProfit"
                        type="number"
                        step="any"
                        placeholder="Take Profit..."
                        className="w-32 sm:w-[200px] md:w-[250px] lg:w-[300px]"
                      ></Input>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex flex-row p-1 sm:p-2 md:p-3 lg:p-5 mx-auto space-x-2">
                      <BasePairDropdown
                        onBasePairChange={handleBasePairChange}
                      ></BasePairDropdown>
                      <QuotePairDropdown
                        onQuotePairChange={handleQuotePairChange}
                      ></QuotePairDropdown>
                    </div>
                    <div className="p-1 sm:p-2 md:p-3 lg:p-5">
                      <Textarea
                        id="tradeNotes"
                        name="tradeNotes"
                        placeholder="Notes..."
                        className="w-[170px] sm:w-[200px] md:w-[250px] lg:w-[300px] h-[185px] sm:h-[210px] md:h-[230px] lg:h-[280px] resize-none border text-sm"
                        maxLength={1250}
                      ></Textarea>
                    </div>
                  </div>
                </div>
                <div className="p-3 text-center">
                  <Button type="submit" className="w-24 md:w-36 lg:w-52">
                    Submit Entry
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
export default withAuth(tradeEntry);
