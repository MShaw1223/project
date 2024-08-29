import { NextPage } from "next";
import { FaUserFriends } from "react-icons/fa";
import * as React from "react";
import withAuth from "@/components/authorise";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EditUserPage from "@/components/users/editUserPage";
import DeleteUserPage from "@/components/users/DeleteUser";
const userPage: NextPage = () => {
  return (
    <>
      <div className="flex h-screen bg-slate-200">
        <div className="flex-1 flex flex-col overflow-hidden items-center">
          <div className="flex p-3 text-3xl justify-center">
            <FaUserFriends className="w-10 h-10"></FaUserFriends>
            <span className="ml-2 font-bold">Users</span>
          </div>
          <div className="flex-1 overflow-auto">
            <Tabs defaultValue="edit" className="p-2 m-1">
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
