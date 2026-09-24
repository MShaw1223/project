import { NextPage } from "next";
import { PenLine } from "lucide-react";
import TradeEntryForm from "@/components/tradeEntry/TradeEntryForm";
import { PageHeader } from "@/components/layout/PageHeader";
import withSession from "@/components/withSession";

const TradeEntryPage: NextPage = () => (
  <>
    <title>FXTrax - Trade Entry</title>
    <PageHeader icon={PenLine} title="Trade Entry" description="Log a new trade to your journal." />
    <TradeEntryForm />
  </>
);

export default withSession(TradeEntryPage);
