import { NextPage } from "next";
import { FaUserFriends } from "react-icons/fa";
import Menu from "@/utils/menu";
import * as React from "react";
import withAuth from "@/utils/protection/authorise";
import { Button } from "@/components/ui/button";
import SelectEdit from "@/utils/users/editUserDD";
import { useRouter } from "next/router";

const userPage: NextPage = () => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [edit, setEdit] = React.useState<string>("");
  const router = useRouter();
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    console.log("Handle Submit works");
    const data = new FormData(event.target as HTMLFormElement);
    const { li: loggedInVal } = router.query;
    await fetch("", {
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
      <div className="flex h-screen bg-slate-200">
        <Menu isOpen={menuOpen} setIsOpen={setMenuOpen} />
        <div
          className={`flex-1 flex flex-col overflow-hidden ${
            menuOpen ? "ml-20" : ""
          }`}
        >
          <div className="flex p-3 text-3xl">
            <FaUserFriends className="w-10 h-10"></FaUserFriends>
            <span className="ml-16 font-bold">Users</span>
          </div>
          <div className="flex-1 overflow-auto justify-center p-2">
            <form onSubmit={handleSubmit}>
              <h1 className="font-bold text-lg">Edit User</h1>
              <div className="p-3">
                <SelectEdit onFieldChange={handleFieldChange}></SelectEdit>
              </div>
              <div className="p-2">
                <p>Enter the edit here</p>
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
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default withAuth(userPage);
