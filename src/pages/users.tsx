//user page: created, switched and deleted

import { useState, FormEvent } from "react";
import { NextPage } from "next";
import { FaUserFriends } from "react-icons/fa";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Menu from "@/utils/menu";
import DeleteUser from "@/utils/DeleteUser";
import ProfileCreate from "@/utils/createProfile";
import EditUser from "@/utils/EditUser";

const userPage: NextPage = () => {
  return (
    <div className="flex h-screen">
      <Menu />
      <div className="flex-1 overflow-hidden">
        <div className="flex p-3 text-3xl">
          <FaUserFriends className="w-10 h-10"></FaUserFriends>
          <span className="ml-16 font-bold">Users</span>
        </div>
        <div className="flex-1 overflow-auto justify-center p-2">
          <Tabs defaultValue="create" className="w-[800px] p-3 m-1">
            <TabsList className="m-2 mb-6">
              <TabsTrigger value="create">Create a User</TabsTrigger>
              <TabsTrigger value="edit">Edit a User</TabsTrigger>
              <TabsTrigger value="delete">Delete a User</TabsTrigger>
            </TabsList>
            <TabsContent value="create">
              <ProfileCreate />
            </TabsContent>
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

export default userPage;
