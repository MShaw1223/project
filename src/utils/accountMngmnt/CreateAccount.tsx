import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation } from "react-query";
import { FormEvent } from "react";

const CreateAccountPage = () => {
  const mutation = useMutation({
    mutationFn: async (formData: string) => {
      const response = await fetch("/api/accmngmnt/newAccount", {
        method: "POST",
        body: formData,
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error("Failed to send off new account");
      }
      return response.json();
    },
    onError: (error) => {
      console.error("Mutation error", error);
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData(event.target as HTMLFormElement);
    const accountname = data.get("accountName");
    const reEntered = data.get("reEnteredAccountName");
    if (accountname !== reEntered) {
      alert("Entries do not match");
      return;
    }
    if (accountname === reEntered) {
      const dataPackage = JSON.stringify({
        accountname,
      });
      mutation.mutate(dataPackage);
    }
  }
  return (
    <>
      <div className="flex">
        {mutation.isLoading && <p>Submitting New Account</p>}
        {!mutation.isLoading && (
          <div className="flex items-center justify-center">
            <form onSubmit={handleSubmit}>
              <h1 className="font-bold text-lg underline underline-offset-8">
                New Account
              </h1>
              <div className="flex flex-row w-[770px]">
                <div className="p-2 w-full">
                  <h3>Enter the name of the new account</h3>

                  <Input
                    id="accountName"
                    name="accountName"
                    placeholder="New Account Name....."
                  />
                </div>
                <div className="p-2 pl-5 w-full">
                  <h3>Re-enter the Account Name</h3>
                  <Input
                    id="reEnteredAccountName"
                    name="reEnteredAccountName"
                    placeholder="Re-enter Account Name..."
                  />
                </div>
              </div>
              <div className="p-3 text-center">
                <Button type="submit">Submit New</Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  );
};
export default CreateAccountPage;
