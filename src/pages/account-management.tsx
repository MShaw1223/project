import Menu from "@/utils/menu";
import { NextPage } from "next";
import { MdOutlineAccountBalance } from "react-icons/md";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DepositAccount from "@/utils/makeDeposit";
import CreateAccount from "@/utils/createAccount";
import DeleteAccount from "@/utils/DeleteAccount";

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
          <Tabs defaultValue="account" className="w-[800px] p-3 m-1">
            <TabsList className="m-2 mb-6">
              <TabsTrigger value="deposit">
                Deposit to a trading account
              </TabsTrigger>
              <TabsTrigger value="create">
                Create a new trading account
              </TabsTrigger>
              <TabsTrigger value="delete">Delete a trading Account</TabsTrigger>
            </TabsList>
            <TabsContent value="deposit">
              <DepositAccount />
            </TabsContent>
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
