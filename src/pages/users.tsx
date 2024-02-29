import { NextPage } from "next";
import { FaUserFriends } from "react-icons/fa";
import Menu from "@/utils/menu";
import * as React from "react";
import withAuth from "@/utils/protection/authorise";

const userPage: NextPage = () => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    console.log("Handle Submit works");
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
              {/* 
        //todo: dropdown of input or password to change (both varchar), 
        if user changes then have a different api called (same file) that will redo the hash for li
        
        */}
              <h3>temp: click button</h3>
              {/* <div className="p-2">
          <Input placeholder="Username....." />
        </div>
        <div className="p-2">
          <Input placeholder="Password....." />
        </div> */}
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
