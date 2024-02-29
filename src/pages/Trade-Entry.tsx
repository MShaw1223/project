import AccountDropdown from "@/utils/selectAccount";
import { Button } from "@/components/ui/button";
import { useMutation } from "react-query";
import * as React from "react";
import { NextPage } from "next";
import Menu from "@/utils/menu";
import { FaPencilAlt } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BasePairDropdown, QuotePairDropdown } from "@/utils/selectPair";
import { OutcomeDropdown } from "@/utils/tradeEntry/outcome";
import withAuth from "@/utils/protection/authorise";

const tradeEntry: NextPage = () => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [selectedAccount, setSelectedAccount] = React.useState<string>("");
  const [selectedBasePair, setSelectedBasePair] = React.useState<string>("");
  const [selectedQuotePair, setSelectedQuotePair] = React.useState<string>("");
  const [selectedOutcome, setSelectedOutcome] = React.useState<string>("");
  const mutation = useMutation({
    mutationFn: async (formData: string) => {
      const response = await fetch("/api/tradeEntry/entries", {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });
      console.log("Response in TE: ", response);
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

  async function getID(selectedAccount: string) {
    const acctID = await fetch("/api/tradeEntry/findActID", {
      method: "POST",
      body: JSON.stringify(selectedAccount),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const lgdin = await acctID.json();
    console.log("Account ID: ", lgdin);
    return lgdin;
  }
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.target as HTMLFormElement);
    const accountID = await getID(selectedAccount);
    console.log("Trade Data: ", {
      entryPrice: parseFloat(data.get("entryPrice") as string),
      stopLoss: parseFloat(data.get("stopLoss") as string),
      takeProfit: parseFloat(data.get("takeProfit") as string),
      riskRatio: parseFloat(data.get("riskRatio") as string),
      BasePair: selectedBasePair,
      QuotePair: selectedQuotePair,
      currencyPair: selectedBasePair + selectedQuotePair,
      tradeNotes: data.get("tradeNotes"),
      winOrLoss: selectedOutcome,
      acctID: accountID,
    });
    try {
      mutation.mutate(
        JSON.stringify({
          accountID: accountID,
          selectedPair: selectedBasePair + selectedQuotePair,
          entryPrice: parseFloat(data.get("entryPrice") as string),
          riskRatio: parseFloat(data.get("riskRatio") as string),
          stopLoss: parseFloat(data.get("stopLoss") as string),
          takeProfit: parseFloat(data.get("takeProfit") as string),
          tradeNotes: data.get("tradeNotes"),
          selectedOutcome: selectedOutcome,
        })
      );
    } catch (error) {
      alert("Error Submitting Trade");
      console.log("Error submitting data: ", error);
    }
  }
  return (
    <>
      <div className="flex h-screen bg-slate-200">
        <Menu isOpen={menuOpen} setIsOpen={setMenuOpen} />
        <div
          className={`flex-1 flex flex-col overflow-hidden ${
            menuOpen ? "ml-20" : ""
          }`}
        >
          <div className="flex p-3 text-3xl">
            <FaPencilAlt className="h-10 w-10"></FaPencilAlt>
            <span className="ml-4 my-auto font-bold">Trade Entry</span>
          </div>
          <div className="flex w-full overflow-auto p-5 mx-auto justify-center items-center">
            {mutation.isLoading && <p>Submitting Trade Data...</p>}
            {!mutation.isLoading && (
              <div className="flex ">
                <form onSubmit={handleSubmit}>
                  <div className="flex flex-col">
                    <div className="flex flex-row">
                      <div className="p-3">
                        <AccountDropdown
                          onAccountChange={handleAccountChange}
                        ></AccountDropdown>
                      </div>
                      <div className="p-3">
                        <OutcomeDropdown
                          on_outcome_change={handleOutcomeChange}
                        ></OutcomeDropdown>
                      </div>
                    </div>
                    <div className="flex flex-row">
                      <div className="flex flex-col p-3">
                        <div className="pb-3">
                          <Input
                            id="entryPrice"
                            name="entryPrice"
                            type="number"
                            step="any"
                            placeholder="Entry Price..."
                          ></Input>
                        </div>
                        <div className="py-3">
                          <Input
                            id="stopLoss"
                            name="stopLoss"
                            type="number"
                            step="any"
                            placeholder="Stop Loss..."
                          ></Input>
                        </div>
                        <div className="py-3">
                          <Input
                            id="takeProfit"
                            name="takeProfit"
                            type="number"
                            step="any"
                            placeholder="Take Profit..."
                          ></Input>
                        </div>
                        <div className="flex flex-row">
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
                        <div className="p-3">
                          <Textarea
                            id="tradeNotes"
                            name="tradeNotes"
                            placeholder="Notes..."
                            className="w-full h-[180px] resize-none border text-sm"
                            maxLength={1250}
                          ></Textarea>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 text-center">
                      <Button type="submit">Submit Entry</Button>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
export default withAuth(tradeEntry);
