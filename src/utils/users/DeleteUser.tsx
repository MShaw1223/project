import { Button } from "@/components/ui/button";
import { NextPage } from "next";
import { useRouter } from "next/router";
import * as React from "react";

const DeleteUserPage: NextPage = () => {
  const router = useRouter();
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    console.log("Handle Submit works");
    const { li: loggedInVal } = router.query;
    console.log("Li: ", loggedInVal);
    if (typeof loggedInVal !== "string") {
      const getuserID = await fetch("/api/tradeEntry/findActID", {
        method: "POST",
        body: JSON.stringify(loggedInVal),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const done = await fetch("/api/users/deleteUser", {
        method: "DELETE",
        body: JSON.stringify({
          userID: await getuserID.json(),
        }),
      });
      if (!done.ok) {
        throw new Error("Failed to delete data");
      } else if (done.ok) {
        router.push("/");
      }
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
