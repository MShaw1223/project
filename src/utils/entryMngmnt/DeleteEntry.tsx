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
        {mutation.isLoading && <p>Deleting User...</p>}
        {!mutation.isLoading && (
          <div className="flex items-center justify-center">
            <form onSubmit={handleSubmit}>
              <h1 className="font-bold text-lg underline underline-offset-8">
                Delete Trade
              </h1>
              <div className="flex flex-row w-fit">
                <div className="p-3">
                  <AccountDropdown
                    onAccountChange={handleAccountChange}
                  ></AccountDropdown>
                </div>
                <div className="p-3 w-full">
                  <Input
                    id="tradeID"
                    name="tradeID"
                    type="number"
                    placeholder="Trade ID....."
                  />
                </div>
                <div className="p-3 text-center">
                  <Button type="submit" variant="destructive">
                    Delete Trade
                  </Button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  );
};

export default DeleteEntry;
