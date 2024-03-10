import { Button } from "@/components/ui/button";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const DeleteUserPage: NextPage = () => {
  const router = useRouter();
  const [ID, setID] = useState<string>();
  useEffect(() => {
    async function getuserID() {
      const { li: loggedInVal } = router.query;
      console.log("Li: ", loggedInVal);
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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    try {
      console.log("Handle Submit works");
      const done = await fetch("/api/users/deleteUser", {
        method: "DELETE",
        body: JSON.stringify({
          userID: ID,
        }),
      });
      if (!done.ok) {
        const errMessage = await done.text();
        throw new Error(errMessage);
      }
      router.push("/");
    } catch (error) {
      alert("Unable to complete deletion");
    }
  }
  return (
    <>
      <div className="overflow-auto justify-center p-2">
        <form onSubmit={handleSubmit}>
          <h1 className="font-bold text-lg">Delete User</h1>
          <div className="m-1 p-2 w-[450px]">
            <div className="p-2">
              <p>Deleting this user will delete all associated data</p>
            </div>
            <div className="p-4">
              <Button type="submit" className="w-full" variant="destructive">
                Delete User
              </Button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default DeleteUserPage;
