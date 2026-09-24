import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AccountStats } from "@/lib/tradeStats";

export type AccountSummary = AccountStats & { id: string; name: string };

const orDash = (value: string | undefined) => value ?? "—";

export function AccountSummaryTable({ rows }: { rows: AccountSummary[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Account</TableHead>
          <TableHead className="text-right">Trades</TableHead>
          <TableHead className="text-right">Win rate</TableHead>
          <TableHead>Best pair</TableHead>
          <TableHead>Worst pair</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium">{row.name}</TableCell>
            <TableCell className="text-right tabular-nums">{row.totalTrades}</TableCell>
            <TableCell className="text-right tabular-nums">
              {row.winPercentage !== undefined ? `${row.winPercentage}%` : "—"}
            </TableCell>
            <TableCell>{orDash(row.bestPair)}</TableCell>
            <TableCell>{orDash(row.worstPair)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
