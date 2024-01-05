import Menu from "@/utils/menu";
import { NextPage } from "next";
import { FaCalculator } from "react-icons/fa";
import { useState } from "react";
import EntryMntDropdown from "@/utils/EntryMntChoiceDropdown";
import DeleteEntry from "@/utils/DeleteEntry";
import EditEntry from "@/utils/EditEntry";
import SearchEntry from "@/utils/SearchEntry";

const EntryManagement: NextPage = () => {
  const [selectedChoice, onChoiceChange] = useState<string>("");

  const handleChoiceChange = (selectedChoice: string) => {
    onChoiceChange(selectedChoice);
  };
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
          <EntryMntDropdown
            onChoiceChange={handleChoiceChange}
          ></EntryMntDropdown>
          <div>
            {selectedChoice === "" && (
              <h1 className="p-3">
                Here on the Entry Management page you select between searching
                for an entry, editing an entry and deleting an entry from the
                dropdown above!
              </h1>
            )}
            {selectedChoice === "search" && <SearchEntry />}
            {selectedChoice === "edit" && <EditEntry />}
            {selectedChoice === "delete" && <DeleteEntry />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntryManagement;
