import { Wallet } from "lucide-react";
import { AccountList } from "@/components/accounts/AccountList";
import { CreateAccount } from "@/components/accounts/CreateAccount";
import { PageHeader } from "@/components/layout/PageHeader";

const AccountsPage = () => (
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

export default AccountsPage;
