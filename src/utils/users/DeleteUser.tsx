import { Button } from "@/components/ui/button";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useState, FormEvent } from "react";
import { useMutation } from "react-query";

const DeleteUserPage: NextPage = () => {
  const router = useRouter();
  const [ID, setID] = useState<string>("");
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
  const mutation = useMutation({
    //formdata is likely the root cause? if not look at how id is handled front and backend
//     Error deleting user:   error: invalid input syntax for type integer: ""
//     at (node_modules/@neondatabase/serverless/index.js:1340:61)
//     at (src/pages/api/users/deleteUser.ts:28:31)
//     at (node_modules/next/dist/esm/server/web/adapter.js:157:0) {
//   length: 105,
//   name: 'error',
//   severity: 'ERROR',
//   code: '22P02',
//   detail: undefined,
//   hint: undefined,
//   position: '52',
//   internalPosition: undefined,
//   internalQuery: undefined,
//   where: undefined,
//   schema: undefined,
//   table: undefined,
//   column: undefined,
//   dataType: undefined,
//   constraint: undefined,
//   file: 'numutils.c',
//   line: '232',
//   routine: 'pg_strtoint32'
// }
// userid is also in default state of ""
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
