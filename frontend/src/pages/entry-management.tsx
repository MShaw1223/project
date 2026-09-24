import { NextPage } from "next";
import { useState } from "react";
import { Table2 } from "lucide-react";
import AccountSelect from "@/components/AccountSelect";
import TradeList from "@/components/entryManagement/TradeList";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import withSession from "@/components/withSession";

const EntryManagement: NextPage = () => {
  const [accountId, setAccountId] = useState("");
  return (
    <>
      <title>FXTrax - Entry Management</title>
      <PageHeader
        icon={Table2}
        title="Manage Entries"
        description="Review and remove recorded trades."
        actions={
          <div className="w-full sm:w-52">
            <AccountSelect value={accountId} onChange={setAccountId} />
          </div>
        }
      />
      <Card>
        <CardContent className="p-4 sm:p-6">
          <TradeList accountId={accountId} />
        </CardContent>
      </Card>
    </>
  );
};

export default withSession(EntryManagement);
