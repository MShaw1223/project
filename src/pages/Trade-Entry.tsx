import AccountDropdown from "@/utils/tradeEntry/selectAccount";
import { Button } from "@/components/ui/button";
import { useMutation } from "react-query";
import { useState, FormEvent } from "react";
import { NextPage } from "next";
import Menu from "@/utils/menu";
import { FaPencilAlt } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BasePairDropdown, QuotePairDropdown } from "@/utils/selectPair";
import { OutcomeDropdown } from "@/utils/tradeEntry/outcome";

const tradeEntry: NextPage = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [selectedBasePair, setSelectedBasePair] = useState<string>("");
  const [selectedQuotePair, setSelectedQuotePair] = useState<string>("");
  const [selectedOutcome, setSelectedOutcome] = useState<string>("");

  const mutation = useMutation({
    mutationFn: async (formData: string) => {
      const response = await fetch("/api/entries", {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "application/json",
        },
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
    const BasePair = selectedBasePair;
    const QuotePair = selectedQuotePair;
    const currencyPair = BasePair + QuotePair;
    const tradeNotes = data.get("tradeNotes");
    const winOrLoss = selectedOutcome;
    const userID = 1;
    const accountID = 6;
    if (!entryPrice) {
      alert("Invalid entry price");
      return;
    }
    if (!stopLoss) {
      alert("Invalid stop loss");
      return;
    }
    if (!takeProfit) {
      alert("Invalid take profit");
      return;
    }
    if (!riskRatio) {
      alert("Invalid risk ratio");
      return;
    }
    if (currencyPair === "") {
      alert("Invalid currency pair");
      return;
    }
    if (selectedAccountValue === "") {
      alert("Invalid account");
      return;
    }
    if (tradeNotes === "") {
      alert("Invalid notes");
      return;
    }
    if (winOrLoss === "") {
      alert("Invalid outcome");
      return;
    }
    if (entryPrice === stopLoss) {
      alert("Invalid stop loss");
      return;
    }
    if (entryPrice === takeProfit) {
      alert("Invalid take profit");
      return;
    }
    if (riskRatio <= 0) {
      alert("Invalid risk ratio");
      return;
    }
    if (selectedOutcome === "") {
      alert("Invalid outcome");
      return;
    }
    if (BasePair === QuotePair) {
      alert("Invalid currency pair");
      return;
    }
    try {
      const dataPackage = JSON.stringify({
        accountID,
        selectedPair: currencyPair,
        entryPrice,
        riskRatio,
        stopLoss,
        takeProfit,
        tradeNotes,
        userID,
        selectedOutcome: winOrLoss,
      });
      mutation.mutate(dataPackage);
    } catch (e) {
      console.log(e);
    }
  }

  return (
    //
    //
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
          <div className="w-full overflow-auto p-5 mt-8">
            <div>
              {mutation.isLoading && <p>Submitting Trade Data...</p>}
              {!mutation.isLoading && (
                <div className="flex justify-center">
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
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default tradeEntry;
