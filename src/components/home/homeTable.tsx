import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { HomeData } from "@/pages/home";

interface tableData {
  data: HomeData[];
}

export default function HomeTable({ data }: tableData) {
  return (
    <Table className="bg-gray-400 w-auto sm:w-[400px] md:w-[500px] lg:w-[700px] rounded-2xl">
      <TableCaption className="text-gray-500">
        Overview of trades on all accounts
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="text-slate-200 text-xs lg:text-2xl md:text-lg sm:text-sm">
            Account
          </TableHead>
          <TableHead className="text-slate-200 text-xs lg:text-2xl md:text-lg sm:text-sm">
            Trades
          </TableHead>
          <TableHead className="text-slate-200 text-xs lg:text-2xl md:text-lg sm:text-sm">
            Win Rate
          </TableHead>
          <TableHead className="text-slate-200 text-xs lg:text-2xl md:text-lg sm:text-sm">
            Best Pair
          </TableHead>
          <TableHead className="text-slate-200 text-xs lg:text-2xl md:text-lg sm:text-sm">
            Worst Pair
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data &&
          data.map((data) => (
            <TableRow key={data.accountName}>
              <TableCell className="text-xs lg:text-2xl md:text-lg sm:text-sm">
                {data.accountName !== undefined ? data.accountName : "0"}
              </TableCell>
              <TableCell className="text-xs lg:text-2xl md:text-lg sm:text-sm">
                {data.totalTrades !== undefined ? data.totalTrades : "0"}
              </TableCell>
              <TableCell className="text-xs lg:text-2xl md:text-lg sm:text-sm">
                {data.winPercentage !== undefined && data.winPercentage !== null
                  ? `${data.winPercentage}%`
                  : "0%"}
              </TableCell>
              <TableCell className="text-xs lg:text-2xl md:text-lg sm:text-sm">
                {data.bestPair !== undefined ? data.bestPair : "N/A"}
              </TableCell>
              <TableCell className="text-xs lg:text-2xl md:text-lg sm:text-sm">
                {data.worstPair !== undefined ? data.worstPair : "N/A"}
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
}
