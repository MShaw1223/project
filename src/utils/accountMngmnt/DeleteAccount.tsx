import AccountDropdown from "@/utils/tradeEntry/selectAccount";
import { NextPage } from "next";
import { FormEvent, useState } from "react";
import { useMutation } from "react-query";
import { Button } from "@/components/ui/button";

const DeleteAccount: NextPage = () => {
  const [selectedAccount, setSelectedAccount] = useState<string>("");

  const mutation = useMutation({
    mutationFn: async (formData: string) => {
      const response = await fetch("/api/deleteAccount", {
        method: "DELETE",
        body: formData,
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-cache",
      });
      if (!response.ok) {
        throw new Error("Failed to submit trade data");
      }

      return response.json();
    },
    onSettled: () => {
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

    const selectedAccountValue = selectedAccount;
    const dataPackage = JSON.stringify({ accountname: selectedAccountValue });
    console.log(dataPackage);
    mutation.mutate(dataPackage);
  }
  return (
    <>
      <div className="flex">
        {mutation.isLoading && <div>Deleting Account...</div>}
        {!mutation.isLoading && (
          <div className="flex items-center justify-center">
            <form onSubmit={handleSubmit}>
              <h1 className="font-bold text-lg underline underline-offset-8">
                Delete Account
              </h1>
              <div className="flex flex-row w-[450px]">
                <div className="p-2 w-full">
                  <AccountDropdown
                    onAccountChange={handleAccountChange}
                  ></AccountDropdown>
                </div>
                <div className="p-3 text-center">
                  <Button type="submit" variant="destructive">
                    Delete Account
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
export default DeleteAccount;
