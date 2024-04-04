import { NextPage } from "next";
import { FaUserFriends } from "react-icons/fa";
import Menu from "@/utils/menu";
import * as React from "react";
import withAuth from "@/utils/protection/authorise";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EditUserPage from "@/utils/users/editUserPage";
import DeleteUserPage from "@/utils/users/DeleteUser";
const userPage: NextPage = () => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  return (
    <>
      <div className="flex h-screen bg-slate-200">
        <Menu isOpen={menuOpen} setIsOpen={setMenuOpen} />
        <div
          className={`flex-1 flex flex-col overflow-hidden ${
            menuOpen ? "ml-20" : ""
          }`}
        >
          <div className="flex p-3 text-3xl justify-center">
            <FaUserFriends className="w-10 h-10"></FaUserFriends>
            <span className="ml-10 font-bold">Users</span>
          </div>
          <div className="flex-1">
            <Tabs defaultValue="edit" className="p-3 m-1">
              <TabsList>
                <TabsTrigger value="edit">Edit your User</TabsTrigger>
                <TabsTrigger value="delete">Delete your User</TabsTrigger>
              </TabsList>
              <TabsContent value="edit">
                <EditUserPage />
              </TabsContent>
              <TabsContent value="delete">
                <DeleteUserPage />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
};

export default withAuth(userPage);
