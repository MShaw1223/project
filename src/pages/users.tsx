import { NextPage } from "next";
import { FaUserFriends } from "react-icons/fa";
import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EditUserPage from "@/components/users/editUserPage";
import DeleteUserPage from "@/components/users/DeleteUser";
import withKey from "@/components/keyChecker";

const userPage: NextPage = () => {
  return (
    <>
      <title>FXTrax - Users</title>

      <div className="flex h-screen bg-slate-200">
        <div className="flex flex-1 flex-col items-center overflow-hidden">
          <div className="flex justify-center p-3 text-3xl">
            <FaUserFriends className="h-10 w-10"></FaUserFriends>
            <span className="ml-2 font-bold">Users</span>
          </div>
          <div className="flex-1 overflow-auto">
            <Tabs defaultValue="edit" className="m-1 p-2">
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

export default withKey(userPage);
