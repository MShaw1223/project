import { NextPage } from "next";
import { FaUserFriends } from "react-icons/fa";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Menu from "@/utils/menu";
import * as React from "react";
import withAuth from "@/utils/protection/authorise";

const userPage: NextPage = () => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  return (
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
          
        </div>
      </div>
    </div>
  );
};

export default withAuth(userPage);
