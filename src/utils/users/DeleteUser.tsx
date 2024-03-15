import { Button } from "@/components/ui/button";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useState, FormEvent } from "react";
import { useMutation } from "react-query";

const DeleteUserPage: NextPage = () => {
  const router = useRouter();
  const [auth, setAuth] = useState<string>("");
  const [ID, setID] = useState<string>("");
  async function getuserID() {
    const { li: loggedInVal } = router.query;
    console.log("Li: ", loggedInVal);
    if (loggedInVal !== undefined) {
      setAuth(loggedInVal);
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
  const mutation = useMutation({
    mutationFn: async (formData: string) => {
      console.log("Handle Submit works");
      const done = await fetch("/api/users/deleteUser", {
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await getuserID();
    try {
      mutation.mutate(
        JSON.stringify({
          userID: ID,
          authKey: auth,
        })
      );
    } catch (error) {
      alert("Error Deleting User");
      console.log("Error with data: ", error);
    }
  }
  return (
    <>
      <div className="flex">
        {mutation.isLoading && <p>Deleting User...</p>}
        {!mutation.isLoading && (
          <div className="overflow-auto justify-center p-2">
            <form onSubmit={handleSubmit}>
              <h1 className="font-bold text-lg">Delete User</h1>
              <div className="m-1 p-2 w-[450px]">
                <div className="p-2">
                  <p>Deleting this user will delete all associated data</p>
                </div>
                <div className="p-4">
                  <Button
                    type="submit"
                    className="w-full"
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
