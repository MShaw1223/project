import AccountDropdown from "@/utils/selectAccount";
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
import withAuth from "@/utils/protection/authorise";
// import { useRouter } from "next/router";
// import Head from "next/head";

const tradeEntry: NextPage = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [selectedBasePair, setSelectedBasePair] = useState<string>("");
  const [selectedQuotePair, setSelectedQuotePair] = useState<string>("");
  const [selectedOutcome, setSelectedOutcome] = useState<string>("");
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
  // const router = useRouter();
  // const [user, setUser] = useState<string | null>(null);
  // useEffect(() => {
  //   async function getUser() {
  //     const { li } = router.query;
  //     console.log(li);
  //     if (li !== undefined) {
  //       try {
  //         const user = await fetch("/api/auth/userFromHash", {
  //           method: "POST",
  //           body: JSON.stringify(li),
  //           headers: { "Content-Type": "application/json" },
  //         });
  //         const lgdin = await user.json();
  //         console.log("logged in: ", lgdin);
  //         setUser(lgdin);
  //       } catch (error) {
  //         console.error("Error fetching user: ", error);
  //       }
  //     }
  //   }
  //   getUser();
  // }, []);

  const handleAccountChange = async (selectedAccount: string) => {
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
    console.log("User ID: ", lgdin);
    return lgdin;
  }
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.target as HTMLFormElement);
    const entryPrice = parseFloat(data.get("entryPrice") as string);
    const stopLoss = parseFloat(data.get("stopLoss") as string);
    const takeProfit = parseFloat(data.get("takeProfit") as string);
    const riskRatio = parseFloat(data.get("riskRatio") as string);
    const BasePair = selectedBasePair;
    const QuotePair = selectedQuotePair;
    const currencyPair = BasePair + QuotePair;
    const tradeNotes = data.get("tradeNotes");
    const winOrLoss = selectedOutcome;
    const acctID = await getID(selectedAccount);

    console.log("Trade Data: ", {
      entryPrice,
      stopLoss,
      takeProfit,
      riskRatio,
      BasePair,
      QuotePair,
      currencyPair,
      tradeNotes,
      winOrLoss,
      acctID,
    });
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
    if (selectedAccount === "") {
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
      mutation.mutate(
        JSON.stringify({
          accountID: acctID,
          selectedPair: currencyPair,
          entryPrice,
          riskRatio,
          stopLoss,
          takeProfit,
          tradeNotes,
          selectedOutcome: winOrLoss,
        })
      );
    } catch (error) {
      console.log("Error submitting data: ", error);
    }
  }
  return (
    <>
      {/* <Head>
        <title>Trade Entry | {user ? user : ""}</title>
      </Head> */}
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
