import Menu from "@/utils/menu";
import { NextPage } from "next";
import { FaCalculator } from "react-icons/fa";

const EntryManagement: NextPage = () => {
  return (
    <div className="flex h-screen">
      <Menu />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex p-3 text-3xl">
          <FaCalculator className="h-10 w-10"></FaCalculator>
          <span className="ml-4 my-auto font-sans font-bold">
            Entry Management
          </span>
        </div>
        <div className="flex-1 overflow-auto p-4 text-justify justify-center">
          This is where there will be trades searched for, deleted & edited
        </div>
      </div>
    </div>
  );
};

export default EntryManagement;
