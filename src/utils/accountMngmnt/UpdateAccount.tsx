import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as React from "react";
import AccountDropdown from "../selectAccount";
import { useMutation } from "react-query";
const UpdateAccount = () => {
  const [selectedAccount, setSelectedAccount] = React.useState<string>("");
  const mutation = useMutation({
    mutationFn: async (data: string) => {
      const response = await fetch("/api/accmngmnt/updateAcc", {
        method: "PUT",
        body: data,
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error("Failed to edit");
      }
      return response;
    },
  });
  const handleAccountChange = async (selectedAccount: string) => {
    setSelectedAccount(selectedAccount);
  };
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const data = new FormData(event.target as HTMLFormElement);
      const firstEdit = data.get("firstEdit") as string;
      const reEnteredEdit = data.get("reEnteredEdit") as string;
      if (firstEdit !== reEnteredEdit) {
        alert("Entries do not match");
        return;
      }
      if (firstEdit === reEnteredEdit && selectedAccount !== null) {
        try {
          mutation.mutate(
            JSON.stringify({
              accountname: selectedAccount,
              edits: firstEdit,
            })
          );
        } catch (error) {
          alert("Error Editting Account");
        }
      } else {
        throw new Error("Submitted data is incorrect");
      }
    } catch (error) {
      return new Response("Error", {
        status: 403,
      });
    }
  }
  return (
    <>
      <>
        <div className="flex">
          {mutation.isLoading && <p>Submitting Edit...</p>}
          {!mutation.isLoading && (
            <div className="flex items-center justify-center">
              <form onSubmit={handleSubmit}>
                <h1 className="font-bold text-lg underline underline-offset-8">
                  Update Account
                </h1>
                <div className="flex flex-row w-[770px]">
                  <div className="p-3">
                    <AccountDropdown
                      onAccountChange={handleAccountChange}
                    ></AccountDropdown>
                  </div>
                </div>
                <div className="flex flex-row w-[770px]">
                  <div className="p-2 w-full">
                    <h3>Enter the new account name</h3>
                    <Input
                      id="firstEdit"
                      name="firstEdit"
                      placeholder="Enter Edit....."
                    />
                  </div>
                  <div className="p-2 pl-5 w-full">
                    <h3>Re-enter the new account name</h3>
                    <Input
                      id="reEnteredEdit"
                      name="reEnteredEdit"
                      placeholder="Re-enter Edit..."
                    />
                  </div>
                </div>
                <div className="p-3 text-center">
                  <Button type="submit">Submit Edits</Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </>
    </>
  );
};

export default UpdateAccount;
