import { Button } from "@/components/ui/button";
import { useMutation } from "react-query";
import { FormEvent, useEffect, useState } from "react";
import { NextPage } from "next";
import { PairDropdown } from "../selectPair";
import { useRouter } from "next/router";

const DeleteCurrency: NextPage = () => {
  const [selectedPair, setSelectedPair] = useState<string>("");
  const [userID, setUserID] = useState<number>(0);
  const router = useRouter();
  useEffect(() => {
    async function getUserID() {
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
          const loggedIn: number = await response.json();
          setUserID(loggedIn);
        } catch (error) {
          alert("Error fetching user");
        }
      }
    }
    getUserID();
  }, []);
  const mutation = useMutation({
    mutationFn: async (formData: string) => {
      const response = await fetch("/api/currency", {
        method: "DELETE",
        body: formData,
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        alert("Failed to delete");
        return;
      }
      return response.json();
    },
    onSettled: () => {
      setSelectedPair("");
    },
    onError: () => {
      alert("Unable to delete");
      return;
    },
  });
  async function getPairID(selectedPair: string, userID: number) {
    const acctID = await fetch("/api/findPairID", {
      method: "POST",
      body: JSON.stringify({ selectedPair, userID }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const response = await acctID.json();
    const id: number = response.pairid;
    return id;
  }

  const handlePairChange = (selectedPair: string) => {
    setSelectedPair(selectedPair);
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      if (selectedPair !== "") {
        const pairID = await getPairID(selectedPair, userID);
        mutation.mutate(JSON.stringify({ pairID, userID }));
      } else {
        alert("No account selected");
      }
    } catch {
      alert("Error sending request");
    }
  }
  return (
    <>
      <div className="flex m-2 p-4 my-auto">
        {mutation.isLoading && <p>Deleting Currency</p>}
        {!mutation.isLoading && (
          <div className="flex-col mx-auto text-center">
            <form onSubmit={handleSubmit}>
              <div className="p-2 flex-row">
                <h3>Select the pair you want to delete</h3>
                <div className="m-1 pt-4 pb-10">
                  <PairDropdown onPairChange={handlePairChange} />
                </div>
                <div className="p-10 pt-20">
                  <Button
                    type="submit"
                    className="w-24 md:w-36 lg:w-52 m-1"
                    variant="destructive"
                  >
                    Delete Pair
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
export default DeleteCurrency;
