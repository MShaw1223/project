import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation } from "react-query";
import { FormEvent } from "react";

const NewCurrencyPage = () => {
  const mutation = useMutation({
    mutationFn: async (formData: string) => {
      const response = await fetch("/api/newCurrency", {
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData(event.target as HTMLFormElement);
    const pairabbr = data.get("Abbreviation");
    const reEntered = data.get("reEnteredAbbreviation");
    if (pairabbr !== reEntered) {
      alert("Entries do not match");
      return;
    }
    if (pairabbr === reEntered) {
      const dataPackage = JSON.stringify({
        pairabbr,
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
