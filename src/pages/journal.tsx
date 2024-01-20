import { NextPage } from "next";
import Menu from "@/utils/menu";
import { BsFillJournalBookmarkFill } from "react-icons/bs";
import { useState } from "react";

const journal: NextPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <div className="flex h-screen bg-slate-200">
        <Menu isOpen={isOpen} setIsOpen={setIsOpen} />
        <div
          className={`flex-1 flex flex-col overflow-hidden ${
            isOpen ? "" : "ml-[20px]"
          }`}
        >
          <div className="flex p-3 text-3xl">
            {/* <XYZ classname="w-10 h-10"> */}
            <BsFillJournalBookmarkFill />
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
