//user page: created, switched and deleted

import { NextPage } from "next";
import { FaUserFriends } from "react-icons/fa";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Menu from "@/utils/menu";
import DeleteUser from "@/utils/users/DeleteUser";
import EditUser from "@/utils/users/EditUser";
import { useState } from "react";
import withAuth from "@/utils/protection/authorise";

const userPage: NextPage = () => {
  const [menuOpen, setMenuOpen] = useState(false);
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
          <Tabs defaultValue="edit" className="p-3 m-1">
            <TabsList className="m-2 mb-6">
              <TabsTrigger value="edit">Edit User</TabsTrigger>
              <TabsTrigger value="delete">Delete User</TabsTrigger>
            </TabsList>
            <TabsContent value="edit">
              <EditUser />
            </TabsContent>
            <TabsContent value="delete">
              <DeleteUser />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default withAuth(userPage);
