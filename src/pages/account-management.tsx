import Menu from "@/utils/menu";
import { NextPage } from "next";
import { MdOutlineAccountBalance } from "react-icons/md";

const accountManagement: NextPage = () => {
  return (
    <div className="flex h-screen">
      <Menu />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex p-3 text-3xl">
          <MdOutlineAccountBalance className="w-10 h-10"></MdOutlineAccountBalance>
          <span className="ml-4 font-sans font-bold">Account Management</span>
        </div>
        <div className="flex-1 overflow-auto p-4 text-justify justify-center">
          This is where there Accounts can be deleted, created, and deposited
          into
        </div>
      </div>
    </div>
  );
};

export default accountManagement;
