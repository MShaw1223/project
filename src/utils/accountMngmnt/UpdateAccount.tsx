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
      if (firstEdit === reEnteredEdit && selectedAccount !== "") {
        mutation.mutate(
          JSON.stringify({
            accountname: selectedAccount,
            edits: firstEdit,
          })
        );
      } else {
        throw new Error("Submitted data is incorrect");
      }
    } catch (error) {
      alert("Error Editting Account");
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
            <div className="flex-col mx-auto">
              <form onSubmit={handleSubmit}>
                <div className="flex flex-row">
                  <div className="p-2">
                    <h3>Select account to update</h3>
                    <AccountDropdown
                      onAccountChange={handleAccountChange}
                    ></AccountDropdown>
                  </div>
                </div>

                <div className="p-2 flex-row">
                  <h3>Updated account name</h3>
                  <Input
                    id="firstEdit"
                    name="firstEdit"
                    placeholder="Enter Edit....."
                    className="w-[200px] sm:w-48 md:w-[280px] lg:w-[340px]"
                    maxLength={15}
                  />
                </div>
                <div className="p-2 flex-row">
                  <h3>Re-enter update</h3>
                  <Input
                    id="reEnteredEdit"
                    name="reEnteredEdit"
                    placeholder="Re-enter Edit..."
                    className="w-[200px] sm:w-48 md:w-[280px] lg:w-[340px]"
                    maxLength={15}
                  />
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
