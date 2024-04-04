import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NextPage } from "next";
import { FormEvent, useState } from "react";
import { useMutation } from "react-query";
import AccountDropdown from "../selectAccount";

const DeleteEntry: NextPage = () => {
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const mutation = useMutation({
    mutationFn: async (formData: string) => {
      const response = await fetch("/api/entrymngmnt/deleteEntry", {
        method: "DELETE",
        body: formData,
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-cache",
      });
      if (!response.ok) {
        throw new Error("Failed to submit data");
      }

      return response.json();
    },
    onSettled: () => {
      console.log("Trade Deleted");
      setSelectedAccount("");
    },
    onError: (error) => {
      console.error("Mutation error:", error);
    },
  });
  const handleAccountChange = async (selectedAccount: string) => {
    setSelectedAccount(selectedAccount);
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
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.target as HTMLFormElement);
    mutation.mutate(
      JSON.stringify({
        tradesid: Number(data.get("tradeID")),
        accountid: await getID(selectedAccount),
      })
    );
  }
  return (
    <>
      <div className="flex">
        {mutation.isLoading && <p>Deleting Entry...</p>}
        {!mutation.isLoading && (
          <div className="flex-col mx-auto">
            <form onSubmit={handleSubmit}>
              <div className="flex-row">
                <div className="p-3 text-center items-center">
                  <h3>Select the account the trade is on</h3>
                  <AccountDropdown
                    onAccountChange={handleAccountChange}
                  ></AccountDropdown>
                </div>
                <div className="p-3 w-full text-center">
                  <h3>Enter the trade ID of the trade</h3>
                  <Input
                    id="tradeID"
                    name="tradeID"
                    type="number"
                    placeholder="Trade ID....."
                  />
                </div>
              </div>
              <div className="p-3 text-center">
                <h3>
                  Trades cannot be recovered once deleted.
                  <br></br> Are you sure you would like to proceed?
                </h3>
                <Button
                  type="submit"
                  variant="destructive"
                  className="m-3 w-24 md:w-36 lg:w-52"
                >
                  Delete Trade
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  );
};

export default DeleteEntry;
