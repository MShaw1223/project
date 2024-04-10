import { Button } from "@/components/ui/button";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useState, FormEvent, useEffect } from "react";
import { useMutation } from "react-query";

const DeleteUserPage: NextPage = () => {
  const router = useRouter();
  const [ID, setID] = useState<string>("");
  const mutation = useMutation({
    mutationFn: async (formData: string) => {
      const done = await fetch("/api/users", {
        method: "DELETE",
        body: formData,
      });
      if (!done.ok) {
        const errMessage = await done.text();
        throw new Error(errMessage);
      }
    },
    onSettled: () => {
      router.push("/");
    },
    onError: (error) => {
      alert("Unable to complete deletion");
      console.error("Mutation error:", error);
    },
  });
  useEffect(() => {
    async function getuserID() {
      const { li: loggedInVal } = router.query;
      if (loggedInVal !== undefined) {
        const getuserID = await fetch("/api/auth/IDFromHash", {
          method: "POST",
          body: JSON.stringify(loggedInVal),
          headers: {
            "Content-Type": "application/json",
          },
        });
        const foundID = await getuserID.json();
        setID(foundID);
      }
    }
    getuserID();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      mutation.mutate(
        JSON.stringify({
          userID: ID,
        })
      );
    } catch (error) {
      alert("Error Deleting User");
    }
  }
  return (
    <>
      <div className="flex">
        {mutation.isLoading && <p>Deleting User...</p>}
        {!mutation.isLoading && (
          <div className="overflow-auto mx-auto p-2 text-center">
            <form onSubmit={handleSubmit}>
              <div className="m-1 p-2">
                <div className="p-2">
                  <p>Deleting this user will delete all associated data</p>
                </div>
                <div className="p-4">
                  <h3>
                    This action cannot be undone, deleted data cannot be
                    recovered
                  </h3>
                  <Button
                    type="submit"
                    className="w-24 md:w-36 lg:w-52 m-10"
                    variant="destructive"
                  >
                    Delete User
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

export default DeleteUserPage;
