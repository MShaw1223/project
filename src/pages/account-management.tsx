import Menu from "@/components/ui/menu";
import { NextPage } from "next";
import { MdOutlineAccountBalance } from "react-icons/md";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateAccount, DeleteAccount } from "@/utils/accountTabs";

const accountManagement: NextPage = () => {
  return (
    <div className="flex h-screen bg-slate-200">
      <Menu />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex p-3 text-3xl">
          <MdOutlineAccountBalance className="w-10 h-10"></MdOutlineAccountBalance>
          <span className="ml-4  font-bold">Account Management</span>
        </div>
        <div className="flex-1 overflow-auto p-4 text-justify justify-center">
          <Tabs defaultValue="deposit" className="w-[800px] p-3 m-1">
            <TabsList className="m-2 mb-6">
              <TabsTrigger value="create">
                Create a new trading account
              </TabsTrigger>
              <TabsTrigger value="delete">Delete a trading Account</TabsTrigger>
            </TabsList>
            <TabsContent value="create">
              <CreateAccount />
            </TabsContent>
            <TabsContent value="delete">
              <DeleteAccount />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default accountManagement;
