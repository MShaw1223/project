import { PenLine } from "lucide-react";
import { TradeEntryForm } from "@/components/trades/TradeEntryForm";
import { PageHeader } from "@/components/layout/PageHeader";

const TradeEntryPage = () => (
  <>
    <title>FXTrax - New Trade</title>
    <PageHeader icon={PenLine} title="New Trade" description="Log a new trade to your journal." />
    <TradeEntryForm />
  </>
);

export default TradeEntryPage;
