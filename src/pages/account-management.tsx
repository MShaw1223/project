import Menu from "@/components/menu";
import { NextPage } from "next";
import { MdOutlineAccountBalance } from "react-icons/md";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CreateAccount from "@/components/accountMngmnt/CreateAccount";
import DeleteAccount from "@/components/accountMngmnt/DeleteAccount";
import * as React from "react";
import withAuth from "@/components/authorise";
import UpdateAccount from "@/components/accountMngmnt/UpdateAccount";

const accountManagement: NextPage = () => {
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
            <MdOutlineAccountBalance className="w-10 h-10"></MdOutlineAccountBalance>
            <span className="ml-4 font-bold">Account Management</span>
          </div>
          <div className="flex-1 overflow-auto">
            <Tabs defaultValue="create" className="p-2 m-1">
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

export default withAuth(accountManagement);
