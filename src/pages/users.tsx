//user page: created, switched and deleted
"use client";

import DeleteUser from "@/components/ui/DeleteUser";
import ProfileCreate from "@/components/ui/ProfileCreate";
import { NextPage } from "next";
import { FaUserFriends } from "react-icons/fa";
import { Separator } from "@/components/ui/separator";
import EditUser from "@/components/ui/EditUser";
import Menu from "@/utils/menu";

const userPage: NextPage = () => {
  return (
    <div className="flex h-screen">
      <Menu />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex p-3 text-3xl">
          <FaUserFriends className="w-10 h-10"></FaUserFriends>
          <span className="ml-16 font-sans font-bold">Users</span>
        </div>
        <div className="flex-1 overflow-auto text-justify justify-center">
          <div className="flex flex-col flex-wrap items-center mt-3">
            <div className="border-2 border-double p-2 m-4 w-10/12">
              <ProfileCreate />
            </div>
            <Separator className="w-3/4" />

            <div className="border-2 border-double p-2 m-4 w-10/12">
              <DeleteUser />
            </div>
            <Separator className="w-3/4" />

            <div className="border-2 border-double p-2 m-4 w-10/12">
              <EditUser />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default userPage;
