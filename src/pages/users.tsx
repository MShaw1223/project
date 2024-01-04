//user page: created, switched and deleted

import { useState, FormEvent } from "react";
import { NextPage } from "next";
import { FaUserFriends } from "react-icons/fa";
import DropdownChoice from "@/utils/usersPageDropdown";
import Menu from "@/utils/menu";
import DeleteUser from "@/utils/DeleteUser";
import ProfileCreate from "@/utils/ProfileCreate";
import EditUser from "@/utils/EditUser";

const userPage: NextPage = () => {
  const [selectedChoice, onChoiceChange] = useState<string>("");

  const handleChoiceChange = (selectedChoice: string) => {
    onChoiceChange(selectedChoice);
  };

  return (
    <div className="flex h-screen">
      <Menu />
      <div className="flex-1 overflow-hidden">
        <div className="flex p-3 text-3xl">
          <FaUserFriends className="w-10 h-10"></FaUserFriends>
          <span className="ml-16 font-sans font-bold">Users</span>
        </div>
        <div className="flex-1 overflow-auto justify-center p-2">
          <DropdownChoice onChoiceChange={handleChoiceChange}></DropdownChoice>
          <div>
            {selectedChoice === "" && (
              <h1 className="p-3">
                Here on the user page you select between creating a new user,
                and editing and deleting existing users from the dropdown above!
              </h1>
            )}
            {selectedChoice === "edit" && <EditUser />}
            {selectedChoice === "delete" && <DeleteUser />}
            {selectedChoice === "create" && <ProfileCreate />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default userPage;
