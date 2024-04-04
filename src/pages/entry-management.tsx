import Menu from "@/utils/menu";
import { NextPage } from "next";
import { FaCalculator } from "react-icons/fa";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DeleteEntry from "@/utils/entryMngmnt/DeleteEntry";
import SearchEntry from "@/utils/entryMngmnt/SearchEntry";
import NewCurrencyPage from "@/utils/entryMngmnt/NewCurrency";
import * as React from "react";
import withAuth from "@/utils/protection/authorise";

const EntryManagement: NextPage = () => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  return (
    <>
      <div className="flex h-screen bg-slate-200">
        <Menu isOpen={menuOpen} setIsOpen={setMenuOpen} />
        <div
          className={`flex-1 flex flex-col overflow-hidden ${
            menuOpen ? "ml-20" : ""
          }`}
        >
          <div className="flex p-3 text-3xl justify-center">
            <FaCalculator className="h-10 w-10"></FaCalculator>
            <span className="ml-4 font-bold">Entry Management</span>
          </div>
          <div className="flex-1 overflow-auto p-4 w-full">
            <Tabs defaultValue="search" className="p-2 m-1">
              <TabsList>
                <TabsTrigger value="search">Search for an Entry</TabsTrigger>
                <TabsTrigger value="addPair">Add a Currency Pair</TabsTrigger>
                <TabsTrigger value="delete">Delete an Entry</TabsTrigger>
              </TabsList>
              <TabsContent value="search">
                <SearchEntry />
              </TabsContent>
              <TabsContent value="addPair">
                <NewCurrencyPage />
              </TabsContent>
              <TabsContent value="delete">
                <DeleteEntry />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
};

export default withAuth(EntryManagement);
