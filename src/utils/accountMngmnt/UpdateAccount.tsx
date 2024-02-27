import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as React from "react";
import AccountDropdown from "../selectAccount";
import SelectField from "../selectField";
import { generateKey } from "../protection/hash";
const UpdateAccount = () => {
  const [selectedAccount, setSelectedAccount] = React.useState<string>("");
  const [field, setField] = React.useState<string>("");
  const handleAccountChange = async (selectedAccount: string) => {
    setSelectedAccount(selectedAccount);
  };
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const data = new FormData(event.target as HTMLFormElement);
      const accountname = selectedAccount;
      const first = data.get("firstEdit") as string;
      const reEnteredEdit = data.get("reEnteredEdit") as string;
      if (first !== reEnteredEdit) {
        alert("Entries do not match");
        return;
      }
      if (first === reEnteredEdit && accountname !== null) {
        const newhash = generateKey(first);
        const dataPackage = JSON.stringify({
          newKey: newhash,
          field: field,
          accountname: accountname,
          edits: first,
        });
        await fetch("/api/accountMngmnt/updateAcc", {
          method: "PUT",
          body: JSON.stringify(dataPackage),
          headers: { "Content-Type": "application/json" },
        });
      } else {
        throw new Error("Submitted data is incorrect");
      }
    } catch (error) {
      return new Response("Error", {
        status: 403,
      });
    }
  }
  const handleFieldChange = async (selectedfield: string) => {
    setField(selectedfield);
  };
  return (
    <>
      <>
        <div className="flex">
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
                <div className="p-3">
                  <SelectField onFieldChange={handleFieldChange}></SelectField>
                </div>
              </div>
              <div className="flex flex-row w-[770px]">
                <div className="p-2 w-full">
                  <h3>Enter the account edit</h3>
                  <Input
                    id="firstEdit"
                    name="firstEdit"
                    placeholder="Enter Edit....."
                  />
                </div>
                <div className="p-2 pl-5 w-full">
                  <h3>Re-enter the edit</h3>
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
