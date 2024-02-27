import Menu from "@/utils/menu";
import { NextPage } from "next";
import { MdOutlineAccountBalance } from "react-icons/md";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CreateAccount from "@/utils/accountMngmnt/CreateAccount";
import DeleteAccount from "@/utils/accountMngmnt/DeleteAccount";
import * as React from "react";
import withAuth from "@/utils/protection/authorise";
import UpdateAccount from "@/utils/accountMngmnt/UpdateAccount";

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
          <div className="flex p-3 text-3xl">
            <MdOutlineAccountBalance className="w-10 h-10"></MdOutlineAccountBalance>
            <span className="ml-4  font-bold">Account Management</span>
          </div>
          <div className="flex-1 overflow-auto p-4 text-justify justify-center">
            <Tabs defaultValue="create" className="p-3 m-1">
              <TabsList className="m-2 mb-6">
                <TabsTrigger value="create">
                  Create a new trading account
                </TabsTrigger>
                <TabsTrigger value="update">
                  Update an existing trading account
                </TabsTrigger>
                <TabsTrigger value="delete">
                  Delete an existing trading Account
                </TabsTrigger>
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
