import { Button } from "@/components/ui/button";
import { NextPage } from "next";
import { useRouter } from "next/router";
import * as React from "react";

const DeleteUserPage: NextPage = () => {
  const router = useRouter();
  const [ID, setID] = React.useState<number>()
  React.useEffect(() => {
    async function getuserID() {
      const { li: loggedInVal } = router.query;
      console.log("Li: ", loggedInVal);
      if (typeof loggedInVal === "string") {
        const getuserID = await fetch("/api/tradeEntry/IDFromHash", {
          method: "POST",
          body: JSON.stringify(loggedInVal),
          headers: {
            "Content-Type": "application/json",
          },
        });
        setID(getuserID)
      }
    }
    getuserID();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    try {
      event.preventDefault();
      console.log("Handle Submit works");
      if (typeof loggedInVal !== "string") {
        const done = await fetch("/api/users/deleteUser", {
          method: "DELETE",
          body: JSON.stringify({
            userID: JSON.stringify(ID),
          }),
        });
        if (!done.ok) {
          throw new Error("Failed to delete data");
        } else if (done.ok) {
          router.push("/");
        }
      } else {
        throw new Error("Incorrect Method");
      }
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
