import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NextPage } from "next";
import { FormEvent } from "react";
import { useMutation } from "react-query";

const DeleteEntry: NextPage = () => {
  const mutation = useMutation({
    mutationFn: async (formData: string) => {
      const response = await fetch("/api/deleteEntry", {
        method: "DELETE",
        body: formData,
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-cache",
      });
      if (!response.ok) {
        throw new Error("Failed to submit data");
      }

      return response.json();
    },
    onSettled: () => {
      console.log("Trade Deleted");
      const inputElement = document.getElementById(
        "tradeID"
      ) as HTMLInputElement;
      inputElement.value = "";
    },
    onError: (error) => {
      console.error("Mutation error:", error);
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData(event.target as HTMLFormElement);
    const tradesid = Number(data.get("tradeID"));
    const dataPackage = JSON.stringify({ tradesid });
    console.log(dataPackage);
    mutation.mutate(dataPackage);
  }
  return (
    <>
      <div className="flex items-center justify-center">
        {mutation.isLoading && <div>Deleting Trade...</div>}
        {!mutation.isLoading && (
          <div>
            <form onSubmit={handleSubmit}>
              <h1 className="font-bold text-lg underline underline-offset-8">
                Delete Trade
              </h1>
              <div className="flex flex-row w-[450px]">
                <div className="p-2 w-full">
                  <Input
                    id="tradeID"
                    name="tradeID"
                    type="number"
                    placeholder="Trade ID....."
                  />
                </div>
                <div className="p-3 text-center">
                  <Button type="submit" variant="destructive">
                    Delete Trade
                  </Button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  );
};

export default DeleteEntry;
