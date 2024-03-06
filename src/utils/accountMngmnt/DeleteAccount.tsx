import AccountDropdown from "@/utils/selectAccount";
import { FormEvent, useState } from "react";
import { useMutation } from "react-query";
import { Button } from "@/components/ui/button";

//add in a modal that pops up ?? are you sure you want to delete etc
const DeleteAccount = () => {
  const [selectedAccount, setSelectedAccount] = useState<string>("");

  const mutation = useMutation({
    mutationFn: async (formData: string) => {
      const response = await fetch("/api/accmngmnt/deleteAccount", {
        method: "DELETE",
        body: formData,
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-cache",
      });
      if (!response.ok) {
        throw new Error("Failed to delete account");
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
    mutation.mutate(JSON.stringify({ accountname: selectedAccount }));
  }
  return (
    <>
      <div className="flex">
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
      </div>
    </>
  );
};
export default DeleteAccount;
