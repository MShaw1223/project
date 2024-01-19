import { NextPage } from "next";
import Menu from "@/components/ui/menu";
import {TfiAgenda}  from "react-icons/tfi";

const journal: NextPage = () => {
  return (
    <>
      <div className="flex h-screen bg-slate-200">
        <Menu />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex p-3 text-3xl">
            <TfiAgenda classname="w-10 h-10"><TfiAgenda />
            <span className="ml-4  font-bold">Journal</span>
          </div>
          <div className="flex-1 overflow-auto p-4 text-justify justify-center">
            journal content
          </div>
        </div>
      </div>
    </>
  );
};

export default journal;

