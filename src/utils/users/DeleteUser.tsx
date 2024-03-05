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
    await fetch("/api/users/deleteUser", {
      method: "DELETE",
      body: JSON.stringify({
        userID: loggedInVal,
      }),
    });
  }
  return (
    <>
      <div className="overflow-auto justify-center p-2">
        <form onSubmit={handleSubmit}>
          <h1 className="font-bold text-lg">Delete User</h1>
          <div className="m-1 p-2 w-[450px]">
            <div className="p-2">
              <p>Delete Account</p>
            </div>
            <div className="p-4">
              <Button type="submit" className="w-full">
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
