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
        {mutation.isLoading && <p>Deleting Account...</p>}
        {!mutation.isLoading && (
          <div className="flex-col mx-auto m-2">
            <form onSubmit={handleSubmit}>
              <div className="flex-row">
                <div className="p-2 text-center items-center">
                  <h3>Select the account you would like to delete</h3>
                  <AccountDropdown
                    onAccountChange={handleAccountChange}
                  ></AccountDropdown>
                </div>
              </div>
              <div className="p-2 text-center">
                <h3>Data stored on trading accounts cannot be recovered.</h3>
                <br />
                <h3>Are you sure you would like to proceed?</h3>
                <Button
                  type="submit"
                  variant="destructive"
                  className="m-10 w-28 md:w-36 lg:w-52"
                >
                  Delete Account
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  );
};
export default DeleteAccount;
