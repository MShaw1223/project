import { Button } from "@/components/ui/button";
import SelectEdit from "@/utils/users/editUserDD";
import { Input } from "@/components/ui/input";
import { NextPage } from "next";
import { useRouter } from "next/router";
import * as React from "react";

const EditUserPage: NextPage = () => {
  const [edit, setEdit] = React.useState<string>("");
  const router = useRouter();
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    console.log("Handle Submit works");
    const data = new FormData(event.target as HTMLFormElement);
    const { li: loggedInVal } = router.query;
    await fetch("/api/users/editUser", {
      method: "PUT",
      body: JSON.stringify({
        field: edit,
        userID: loggedInVal,
        newInfo: data.get("newInfo") as string,
      }),
    });
  }
  async function handleFieldChange(field: string) {
    setEdit(field);
  }
  return (
    <>
      <div className="overflow-auto justify-center p-2">
        <form onSubmit={handleSubmit}>
          <h1 className="font-bold text-lg">Edit User</h1>
          <div className="p-3">
            <SelectEdit onFieldChange={handleFieldChange}></SelectEdit>
          </div>
          <div className="m-1 p-2 w-[450px]">
            <div className="p-2">
              <p>Change field here</p>
              <Input id="newInfo" name="newInfo" placeholder="New info....." />
            </div>
            <div className="p-4">
              <Button type="submit" className="w-full">
                Submit Change
              </Button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditUserPage;
