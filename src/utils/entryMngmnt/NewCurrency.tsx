import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation } from "react-query";
import { FormEvent, useEffect, useState } from "react";
import { NextPage } from "next";
import { useRouter } from "next/router";

const NewCurrencyPage: NextPage = () => {
  const [user, setUser] = useState<string | null>(null);
  const router = useRouter();
  const mutation = useMutation({
    mutationFn: async (formData: string) => {
      const response = await fetch("/api/entrymngmnt/newCurrency", {
        method: "POST",
        body: formData,
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error("Failed to send off new currency");
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
    const pairabbr = data.get("Abbreviation")! as string;
    const reEntered = data.get("reEnteredAbbreviation")! as string;
    const userid = user!;
    if (pairabbr !== reEntered) {
      alert("Entries do not match");
      return;
    }
    if (pairabbr! || reEntered!) {
      alert("Enter the new pair in both fields");
      return;
    }
    if (userid !== null) {
      mutation.mutate(
        JSON.stringify({
          pairabbr,
          userid,
        })
      );
    }
  }
  return (
    <>
      <div className="flex m-2 p-4 my-auto">
        {mutation.isLoading && <p>Submitting New Currency</p>}
        {!mutation.isLoading && (
          <div className="flex-col mx-auto">
            <form onSubmit={handleSubmit}>
              <div className="p-2 flex-row">
                <h3>Enter currency abbreviation i.e. GBP, BTC etc</h3>
                <Input
                  id="Abbreviation"
                  name="Abbreviation"
                  placeholder="New Currency Abbreviation....."
                  maxLength={4}
                  minLength={3}
                />
              </div>
              <div className="p-2 flex-row">
                <h3>Re-enter the abbreviation</h3>
                <Input
                  id="reEnteredAbbreviation"
                  name="reEnteredAbbreviation"
                  placeholder="Re-enter Abbreviation..."
                  maxLength={4}
                  min={3}
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
export default NewCurrencyPage;
