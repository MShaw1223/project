import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation } from "react-query";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/router";

const CreateAccountPage = () => {
  const [user, setUser] = useState<string | null>(null);
  const router = useRouter();
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
  useEffect(() => {
    async function getUser() {
      const { li: loggedInVal } = router.query;
      if (loggedInVal !== undefined) {
        try {
          const response = await fetch("/api/auth/IDFromHash", {
            method: "POST",
            body: JSON.stringify(loggedInVal),
            headers: {
              "Content-Type": "application/json",
            },
          });
          const lgdin = await response.json();
          setUser(lgdin);
        } catch (error) {
          console.error("Error fetching user: ", error);
        }
      }
    }
    getUser();
  }, []);
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.target as HTMLFormElement);
    const accountname = data.get("accountName")! as string;
    const reEntered = data.get("reEnteredAccountName")! as string;
    if (accountname !== reEntered) {
      alert("Entries do not match");
      return;
    }
    if (!accountname || !reEntered) {
      alert("Enter the new account in both fields");
      return;
    }
    if (accountname === reEntered && user !== null) {
      mutation.mutate(
        JSON.stringify({
          accountname,
          userid: user,
        })
      );
    }
  }
  return (
    <>
      <div className="flex">
        {mutation.isLoading && <p>Submitting New Account</p>}
        {!mutation.isLoading && (
          <div className="flex-col mx-auto">
            <form onSubmit={handleSubmit}>
              <div className="p-2 flex-row">
                <h3>Enter the name of the new account</h3>
                <Input
                  id="accountName"
                  name="accountName"
                  placeholder="New Account Name....."
                  className="sm:w-48 md:w-[280px] lg:w-[340px]"
                />
              </div>
              <div className="p-2 flex-row">
                <h3>Re-enter the Account Name</h3>
                <Input
                  id="reEnteredAccountName"
                  name="reEnteredAccountName"
                  placeholder="Re-enter Account Name..."
                  className="sm:w-48 md:w-[280px] lg:w-[340px]"
                />
              </div>
              <div className="p-3 text-center">
                <Button type="submit" className="w-24 md:w-36 lg:w-52">
                  Submit New
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  );
};
export default CreateAccountPage;
