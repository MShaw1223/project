import { NextPage } from "next";
import { MdOutlineAccountBalance } from "react-icons/md";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CreateAccount from "@/components/accountMngmnt/CreateAccount";
import DeleteAccount from "@/components/accountMngmnt/DeleteAccount";
import * as React from "react";
import UpdateAccount from "@/components/accountMngmnt/UpdateAccount";
import withKey from "@/components/keyChecker";

const accountManagement: NextPage = () => {
  return (
    <>
      <title>FXTrax - Account</title>

      <div className="flex h-screen bg-slate-200">
        <div className="flex flex-1 flex-col items-center overflow-hidden">
          <div className="flex justify-center p-3 text-3xl">
            <MdOutlineAccountBalance className="h-10 w-10"></MdOutlineAccountBalance>
            <span className="ml-2 font-bold">Account Management</span>
          </div>
          <div className="flex-1 overflow-auto">
            <Tabs defaultValue="create" className="m-1 p-2">
              <TabsList>
                <TabsTrigger value="create">Create new account</TabsTrigger>
                <TabsTrigger value="update">Update account</TabsTrigger>
                <TabsTrigger value="delete">Delete account</TabsTrigger>
              </TabsList>
              <TabsContent value="create">
                <CreateAccount />
              </TabsContent>
              <TabsContent value="update">
                <UpdateAccount />
              </TabsContent>
              <TabsContent value="delete">
                <DeleteAccount />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
};

export default withKey(accountManagement);
