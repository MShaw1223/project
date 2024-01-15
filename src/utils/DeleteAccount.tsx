import AccountDropdown from "@/utils/selectAccount";
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
    const dataPackage = JSON.stringify(selectedAccountValue);
    mutation.mutate(dataPackage);
  }
  return (
    <>
      <div className="flex items-center justify-center">
        {mutation.isLoading && <div>Deleting Account...</div>}
        {!mutation.isLoading && (
          <div>
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
                  <Button type="submit">Delete</Button>
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
