import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as React from "react";
import AccountDropdown from "../selectAccount";
const UpdateAccount = () => {
  const [selectedAccount, setSelectedAccount] = React.useState<string>("");
  const handleAccountChange = async (selectedAccount: string) => {
    setSelectedAccount(selectedAccount);
  };
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.target as HTMLFormElement);
    const accountname = selectedAccount;
    const first = data.get("firstEdit");
    const reEnteredEdit = data.get("reEnteredEdit");
    if (first !== reEnteredEdit) {
      alert("Entries do not match");
      return;
    }
    if (first === reEnteredEdit && accountname !== null) {
      const dataPackage = JSON.stringify({
        accountname,
        edits: first,
      });
      await fetch("/api/accountMngmnt/updateAcc", {
        method: "PUT",
        body: JSON.stringify(dataPackage),
        headers: { "Content-Type": "application/json" },
      });
    }
  }
  return (
    <>
      <>
        <div className="flex">
          <div className="flex items-center justify-center">
            <form onSubmit={handleSubmit}>
              <h1 className="font-bold text-lg underline underline-offset-8">
                New Account
              </h1>
              <div className="p-3">
                <AccountDropdown
                  onAccountChange={handleAccountChange}
                ></AccountDropdown>
              </div>
              <div className="flex flex-row w-[770px]">
                <div className="p-2 w-full">
                  <h3>Enter the account Edit</h3>
                  <Input
                    id="firstEdit"
                    name="firstEdit"
                    placeholder="Enter Edit....."
                  />
                </div>
                <div className="p-2 pl-5 w-full">
                  <h3>Re-enter the Edit</h3>
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
        </div>
      </>
    </>
  );
};

export default UpdateAccount;
