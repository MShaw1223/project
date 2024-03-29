import { Button } from "@/components/ui/button";
import SelectEdit from "@/utils/users/editUserDD";
import { Input } from "@/components/ui/input";
import { NextPage } from "next";
import { useRouter } from "next/router";
import * as React from "react";
import { useMutation } from "react-query";

const EditUserPage: NextPage = () => {
  const [edit, setEdit] = React.useState<string>("");
  const [user, setuser] = React.useState<string>("");
  const router = useRouter();
  React.useEffect(() => {
    const getUserID = async () => {
      try {
        const { li: loggedInVal } = router.query;
        console.log("li: ", loggedInVal);
        if (typeof loggedInVal === "string") {
          const user = await fetch("/api/auth/userFromHash", {
            method: "POST",
            body: JSON.stringify(loggedInVal),
            headers: { "Content-Type": "application/json" },
          });
          const lgdin = await user.json();
          setuser(lgdin);
        }
      } catch (error) {
        console.error("Error fetching available accounts:", error);
      }
    };
    getUserID();
  }, []);
  const mutation = useMutation({
    mutationFn: async (data: string) => {
      const response = await fetch("/api/users/editUser", {
        method: "PUT",
        body: data,
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error("Failed to edit");
      }
      return response;
    },
    onSuccess: () => {
      router.push("/");
    },
  });
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const data = new FormData(event.target as HTMLFormElement);
      const placeholder = data.get("newInfo") as string;
      console.log("Handle Submit works, info submitting: ", {
        edit,
        user,
        placeholder,
      });
      mutation.mutate(
        JSON.stringify({
          field: edit,
          user: user,
          newInfo: placeholder,
        })
      );
    } catch (error) {
      alert("Unable to edit user");
    }
  }
  async function handleFieldChange(field: string) {
    setEdit(field);
  }
  return (
    <>
      <div className="flex">
        {mutation.isLoading && <p>Submitting Edit...</p>}
        {!mutation.isLoading && (
          <div className="overflow-auto justify-center p-2">
            <form onSubmit={handleSubmit}>
              <h1 className="font-bold text-lg">Edit User</h1>
              <div className="p-3">
                <SelectEdit onFieldChange={handleFieldChange}></SelectEdit>
              </div>
              <div className="m-1 p-2 w-[450px]">
                <div className="p-2">
                  <p>Change field here</p>
                  <Input
                    id="newInfo"
                    name="newInfo"
                    placeholder="New info....."
                  />
                </div>
                <div className="p-4">
                  <Button type="submit" className="w-full">
                    Submit Change
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

export default EditUserPage;
