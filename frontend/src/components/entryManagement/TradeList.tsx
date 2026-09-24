import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FormError } from "@/components/FormFeedback";
import { TradeOutcome, deleteTrade, getTrades, tradesQueryKey } from "@/lib/trades";

interface TradeListProps {
  accountId: string;
}

function TradeList({ accountId }: TradeListProps) {
  const queryClient = useQueryClient();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const { data: trades = [], isLoading, isError } = useQuery(
    tradesQueryKey(accountId),
    () => getTrades(accountId),
    { enabled: accountId !== "" }
  );

  const mutation = useMutation(deleteTrade, {
    onSuccess: () => queryClient.invalidateQueries(tradesQueryKey(accountId)),
    onSettled: () => setPendingDeleteId(null),
  });

  if (accountId === "") return <EmptyState>Select an account to view its trades.</EmptyState>;
  if (isLoading)
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
      </div>
    );
  if (isError) return <FormError message="Failed to load trades." />;
  if (trades.length === 0) return <EmptyState>No trades recorded for this account yet.</EmptyState>;

  return (
    <div className="space-y-4">
      {mutation.isError && <FormError message="Failed to delete the trade. Please try again." />}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Pair</TableHead>
            <TableHead>Direction</TableHead>
            <TableHead className="text-right">Entry</TableHead>
            <TableHead className="text-right">Close</TableHead>
            <TableHead className="text-right">Stop loss</TableHead>
            <TableHead className="text-right">R</TableHead>
            <TableHead>Outcome</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead className="w-0">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trades.map((trade) => (
            <TableRow key={trade.id}>
              <TableCell className="whitespace-nowrap">{new Date(trade.created_at).toLocaleDateString()}</TableCell>
              <TableCell className="font-medium">{trade.currency_pair}</TableCell>
              <TableCell className="capitalize">{trade.direction || "—"}</TableCell>
              <TableCell className="text-right tabular-nums">{trade.entry_price}</TableCell>
              <TableCell className="text-right tabular-nums">{orDash(trade.exit_price)}</TableCell>
              <TableCell className="text-right tabular-nums">{orDash(trade.stop_loss)}</TableCell>
              <TableCell className="text-right tabular-nums">{formatR(trade.r_multiple)}</TableCell>
              <TableCell>
                <OutcomeBadge outcome={trade.outcome} />
              </TableCell>
              <TableCell className="max-w-[240px] truncate text-muted-foreground" title={trade.notes}>
                {trade.notes}
              </TableCell>
              <TableCell>
                {pendingDeleteId === trade.id ? (
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => mutation.mutate(trade.id)}
                      disabled={mutation.isLoading}
                    >
                      Confirm
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => setPendingDeleteId(null)}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="size-8 text-muted-foreground hover:text-destructive"
                      aria-label="Delete"
                      onClick={() => setPendingDeleteId(trade.id)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

const orDash = (value: number | null) => (value === null ? "—" : String(value));

const formatR = (r: number | null) => (r === null ? "—" : `${r > 0 ? "+" : ""}${r}R`);

const EmptyState = ({ children }: { children: string }) => (
  <div className="flex h-32 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
    <p>{children}</p>
  </div>
);

// outcome dots reuse the dashboard's win/breakeven/loss colours, the label carries the meaning
function OutcomeBadge({ outcome }: { outcome: TradeOutcome }) {
  return (
    <Badge variant="outline" className="gap-1.5 font-medium capitalize">
      <span className="size-2 rounded-full" style={{ backgroundColor: `var(--chart-${outcome})` }} />
      {outcome}
    </Badge>
  );
}

export default TradeList;
