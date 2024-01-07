import Menu from "@/utils/menu";
import { NextPage } from "next";
import { FaCalculator } from "react-icons/fa";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DeleteEntry from "@/utils/DeleteEntry";
import EditEntry from "@/utils/EditEntry";
import SearchEntry from "@/utils/SearchEntry";

const EntryManagement: NextPage = () => {
  return (
    <>
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
            <Tabs defaultValue="account" className="w-[800px] p-3 m-1">
              <TabsList className="m-2 mb-6">
                <TabsTrigger value="delete">Delete an Entry</TabsTrigger>
                <TabsTrigger value="edit">Edit an Entry</TabsTrigger>
                <TabsTrigger value="search">Search for an Entry</TabsTrigger>
              </TabsList>
              <TabsContent value="delete">
                <DeleteEntry />
              </TabsContent>
              <TabsContent value="edit">
                <EditEntry />
              </TabsContent>
              <TabsContent value="search">
                <SearchEntry />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
};

export default EntryManagement;
