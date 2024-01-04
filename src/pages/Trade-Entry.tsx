import { AccountDropdown } from "@/utils/selectAccount";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation } from "react-query";
import { useState, FormEvent } from "react";
import { NextPage } from "next";
import Menu from "@/utils/menu";
import { BsFillJournalBookmarkFill } from "react-icons/bs";

const tradeEntry: NextPage = () => {
  const [selectedAccount, setSelectedAccount] = useState<string>("");

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
    },
    onError: (error) => {
      console.error("Mutation error:", error);
    },
  });

  const handleAccountChange = (selectedAccount: string) => {
    setSelectedAccount(selectedAccount);
  };

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData(event.target as HTMLFormElement);
    const entryPrice = parseFloat(data.get("entryPrice") as string);
    const stopLoss = parseFloat(data.get("stopLoss") as string);
    const takeProfit = parseFloat(data.get("takeProfit") as string);
    const selectedAccountValue = selectedAccount;

    if (
      !entryPrice ||
      !stopLoss ||
      !takeProfit ||
      selectedAccountValue === ""
    ) {
      alert("Invalid entry");
      return;
    }
    const requestData = JSON.stringify({
      entryPrice,
      stopLoss,
      takeProfit,
      selectedAccount: selectedAccountValue,
    });

    mutation.mutate(requestData);
  }

  return (
    <div className="flex h-screen">
      <Menu />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex p-3 text-3xl">
          <BsFillJournalBookmarkFill className="h-10 w-10"></BsFillJournalBookmarkFill>
          <span className="ml-4 my-auto font-sans font-bold">Trade Entry</span>
        </div>
        <div className="flex-1 overflow-auto p-4 text-justify justify-center">
          <div className="text-center">
            {mutation.isLoading && <p>Submitting Trade Data...</p>}
            {!mutation.isLoading && (
              <div className="flex flex-col items-center">
                <div>
                  <AccountDropdown
                    onAccountChange={handleAccountChange}
                  ></AccountDropdown>
                </div>
                <div>
                  <div>
                    <form className="my-auto w-80" onSubmit={handleSubmit}>
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
                      <div className="p-3">
                        <Button type="submit">Submit Entry</Button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default tradeEntry;
