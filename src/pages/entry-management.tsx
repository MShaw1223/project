import { NextPage } from "next";
import { FaCalculator } from "react-icons/fa";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as React from "react";
import Menu from "@/components/menu";
import NewCurrencyPage from "@/components/entryMngmnt/NewCurrency";
import SearchEntry from "@/components/entryMngmnt/SearchEntry";
import DeleteCurrency from "@/components/entryMngmnt/deleteCurrency";
import DeleteEntry from "@/components/entryMngmnt/DeleteEntry";
import withAuth from "@/components/authorise";

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
          <div className="flex-1 overflow-auto">
            <Tabs defaultValue="search" className="p-1 m-1">
              <TabsList>
                <TabsTrigger value="search">Search Entries</TabsTrigger>
                <TabsTrigger value="addPair">Add Currencies</TabsTrigger>
                <TabsTrigger value="delPair">Delete Currencies</TabsTrigger>
                <TabsTrigger value="delete">Delete an Entry</TabsTrigger>
              </TabsList>
              <TabsContent value="search">
                <SearchEntry />
              </TabsContent>
              <TabsContent value="addPair">
                <NewCurrencyPage />
              </TabsContent>
              <TabsContent value="delPair">
                <DeleteCurrency />
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
