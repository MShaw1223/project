import { NextPage } from "next";
import { Wallet } from "lucide-react";
import AccountList from "@/components/accountMngmnt/AccountList";
import CreateAccount from "@/components/accountMngmnt/CreateAccount";
import { PageHeader } from "@/components/layout/PageHeader";
import withSession from "@/components/withSession";

const AccountManagement: NextPage = () => (
  <>
    <title>FXTrax - Accounts</title>
    <PageHeader icon={Wallet} title="Accounts" description="Create, rename and delete your brokerage accounts." />
    <div className="grid items-start gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <AccountList />
      </div>
      <CreateAccount />
    </div>
  </>
);

export default withSession(AccountManagement);
