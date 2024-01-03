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
      <div className="flex-1 overflow-hidden">
        <div className="flex p-3 text-3xl">
          <FaUserFriends className="w-10 h-10"></FaUserFriends>
          <span className="ml-16 font-sans font-bold">Users</span>
        </div>
        <div className="flex-1 overflow-auto justify-center">
          <span>
            Maybe have a dropdown that upon selection renders the utility
            classes so theres more room to play abt w/ ?
          </span>
          <div className="flex flex-col items-center mt-3 mx-5">
            <div className="border-2 border-double p-2 m-4 w-full">
              <ProfileCreate />
            </div>
            <div className="flex flex-col md:flex-row md:items-start w-full">
              <div className="border-2 border-double p-2 m-1 w-full h-full">
                <EditUser />
              </div>
              <div className="border-2 border-double p-2 m-1 w-full h-full">
                <DeleteUser />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default userPage;
