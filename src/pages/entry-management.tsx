import { NextPage } from "next";
import { FaCalculator } from "react-icons/fa";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as React from "react";
import NewCurrencyPage from "@/components/entryMngmnt/NewCurrency";
import SearchEntry from "@/components/entryMngmnt/SearchEntry";
import DeleteCurrency from "@/components/entryMngmnt/deleteCurrency";
import DeleteEntry from "@/components/entryMngmnt/DeleteEntry";
import withKey from "@/components/keyChecker";

const EntryManagement: NextPage = () => {
  return (
    <>
      <title>FXTrax - Entries</title>

      <div className="flex h-screen bg-slate-200">
        <div className="flex flex-1 flex-col items-center overflow-hidden">
          <div className="flex justify-center p-3 text-3xl">
            <FaCalculator className="h-10 w-10"></FaCalculator>
            <span className="ml-2 font-bold">Entry Management</span>
          </div>
          <div className="flex-1 overflow-auto">
            <Tabs defaultValue="search" className="m-1 p-2">
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

export default withKey(EntryManagement);
