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
import withKey from "@/components/keyChecker";

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
      profit: number,
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
          // could include a '/' in the string between pairs to allow seperation and manip in future
          selectedPair: selectedBasePair + selectedQuotePair,
          entryPrice: parseFloat(data.get("entryPrice") as string),
          riskRatio: riskCalculation(
            parseFloat(data.get("entryPrice") as string),
            parseFloat(data.get("stopLoss") as string),
            parseFloat(data.get("takeProfit") as string),
          ),
          stopLoss: parseFloat(data.get("stopLoss") as string),
          takeProfit: parseFloat(data.get("takeProfit") as string),
          tradeNotes: data.get("tradeNotes"),
          selectedOutcome: selectedOutcome,
        }),
      );
    } catch (error) {
      alert("Error Submitting Trade");
    }
  }
  return (
    <>
      <title>FXTrax - Trade Entry</title>

      <div className="flex h-screen bg-slate-200">
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex justify-center p-3 text-3xl">
            <FaPencilAlt className="h-10 w-10"></FaPencilAlt>
            <span className="my-auto ml-4 font-bold">Trade Entry</span>
          </div>
          <div className="flex items-center justify-center p-2 sm:my-auto md:my-auto lg:my-auto">
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
                    <div className="mx-auto flex flex-row space-x-2 p-1 sm:p-2 md:p-3 lg:p-5">
                      <BasePairDropdown
                        onPairChange={handleBasePairChange}
                      ></BasePairDropdown>
                      <QuotePairDropdown
                        onPairChange={handleQuotePairChange}
                      ></QuotePairDropdown>
                    </div>
                    <div className="p-1 sm:p-2 md:p-3 lg:p-5">
                      <Textarea
                        id="tradeNotes"
                        name="tradeNotes"
                        placeholder="Notes..."
                        className="h-[185px] w-[170px] resize-none border text-sm sm:h-[210px] sm:w-[200px] md:h-[230px] md:w-[250px] lg:h-[280px] lg:w-[300px]"
                        maxLength={1250}
                      />
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
export default withKey(tradeEntry);
