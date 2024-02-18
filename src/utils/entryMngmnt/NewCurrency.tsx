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
      const { li } = router.query;
      if (li !== undefined) {
        try {
          const response = await fetch("/api/auth/IDFromHash", {
            method: "POST",
            body: JSON.stringify(li),
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
    const pairabbr = data.get("Abbreviation");
    const reEntered = data.get("reEnteredAbbreviation");
    const userid = user;
    if (pairabbr !== reEntered) {
      alert("Entries do not match");
      return;
    }
    if (pairabbr === reEntered && userid !== null && pairabbr !== null) {
      const dataPackage = JSON.stringify({
        pairabbr,
        userid,
      });
      mutation.mutate(dataPackage);
    }
  }
  return (
    <>
      <div className="flex">
        {mutation.isLoading && <p>Submitting New Currency</p>}
        {!mutation.isLoading && (
          <div className="flex items-center justify-center">
            <form onSubmit={handleSubmit}>
              <h1 className="font-bold text-lg underline underline-offset-8">
                New Currency
              </h1>
              <div className="flex flex-row w-[770px]">
                <div className="p-2 w-full">
                  <h3>Enter the abbreviation of the currency ie GBP</h3>
                  <Input
                    id="Abbreviation"
                    name="Abbreviation"
                    placeholder="New Currency Abbreviation....."
                  />
                </div>
                <div className="p-2 pl-5 w-full">
                  <h3>Re-enter the abbreviation</h3>
                  <Input
                    id="reEnteredAbbreviation"
                    name="reEnteredAbbreviation"
                    placeholder="Re-enter Abbreviation..."
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
export default NewCurrencyPage;
