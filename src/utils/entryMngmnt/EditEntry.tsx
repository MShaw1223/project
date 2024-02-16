import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NextPage } from "next";
import { useMutation } from "react-query";
import { FormEvent } from "react";
import EditDropdown from "./editEntrydropdn";
import { useState } from "react";

const EditEntry: NextPage = () => {
  const [selectedEdit, setSelectedEdit] = useState<string>("");
  const mutation = useMutation({
    mutationFn: async (formData: string) => {
      const response = await fetch("/api/entrymngmnt/editEntry", {
        method: "POST",
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
      console.log("Trade Edited");
      const inputElement = document.getElementById(
        "tradeID"
      ) as HTMLInputElement;
      inputElement.value = "";
    },
    onError: (error) => {
      console.error("Mutation error:", error);
    },
  });

  const handleValueChange = (element: string) => {
    setSelectedEdit(selectedEdit);
  };

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData(event.target as HTMLFormElement);
    const tradesid = Number(data.get("tradeID"));
    const editedData = data.get("editedData");
    const dataPackage = JSON.stringify({
      tradesid,
      editedData,
    });
    console.log(dataPackage);
    mutation.mutate(dataPackage);
  }
  return (
    <>
      <div className="flex">
        {mutation.isLoading && <p>Submitting New Edit</p>}
        {!mutation.isLoading && (
          <div className="flex items-center justify-center">
            <form onSubmit={handleSubmit}>
              <h1 className="font-bold text-lg underline underline-offset-8">
                Edit Entry
              </h1>
              <div className="flex flex-row">
                <div className="p-2">
                  <Input
                    id="tradeID"
                    name="tradeID"
                    type="number"
                    placeholder="Trade ID....."
                  />
                </div>
                <div className="p-2">
                  <EditDropdown onElementChange={handleValueChange} />
                </div>
              </div>
              <div className="flex flex-row p-2">
                <Textarea
                  id="editeddata"
                  name="editeddata"
                  placeholder="Enter edits here..."
                  className="w-full h-[180px] resize-none border text-sm"
                  maxLength={1250}
                />
              </div>
              {/* 
              this was p-4 
              however theres a chance the submit button can be pressed accidentally trying p-7
              trying m-2
              */}
              <div className="p-8 m-2">
                <Button type="submit" className="w-full">
                  Submit Change
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  );
};
export default EditEntry;
