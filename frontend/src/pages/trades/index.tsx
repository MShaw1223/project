import { useState } from "react";
import { Table2 } from "lucide-react";
import { AccountSelect } from "@/components/accounts/AccountSelect";
import { TradeList } from "@/components/trades/TradeList";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";

const TradesPage = () => {
  const [accountId, setAccountId] = useState("");
  return (
    <>
      <title>FXTrax - Trades</title>
      <PageHeader
        icon={Table2}
        title="Trades"
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

export default TradesPage;
