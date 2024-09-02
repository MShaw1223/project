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

type tableData = {
  data: HomeData[];
};

export default function HomeTable({ data }: tableData) {
  return (
    <Table className="w-auto rounded-2xl bg-gray-400 sm:w-[400px] md:w-[500px] lg:w-[700px]">
      <TableCaption className="text-gray-500">
        Overview of trades on all accounts
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="text-xs text-slate-200 sm:text-sm md:text-lg lg:text-2xl">
            Account
          </TableHead>
          <TableHead className="text-xs text-slate-200 sm:text-sm md:text-lg lg:text-2xl">
            Trades
          </TableHead>
          <TableHead className="text-xs text-slate-200 sm:text-sm md:text-lg lg:text-2xl">
            Win Rate
          </TableHead>
          <TableHead className="text-xs text-slate-200 sm:text-sm md:text-lg lg:text-2xl">
            Best Pair
          </TableHead>
          <TableHead className="text-xs text-slate-200 sm:text-sm md:text-lg lg:text-2xl">
            Worst Pair
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data &&
          data.map((data) => (
            <TableRow key={data.accountName}>
              <TableCell className="text-xs sm:text-sm md:text-lg lg:text-2xl">
                {data.accountName !== undefined ? data.accountName : "0"}
              </TableCell>
              <TableCell className="text-xs sm:text-sm md:text-lg lg:text-2xl">
                {data.totalTrades !== undefined ? data.totalTrades : "0"}
              </TableCell>
              <TableCell className="text-xs sm:text-sm md:text-lg lg:text-2xl">
                {data.winPercentage !== undefined && data.winPercentage !== null
                  ? `${data.winPercentage}%`
                  : "0%"}
              </TableCell>
              <TableCell className="text-xs sm:text-sm md:text-lg lg:text-2xl">
                {data.bestPair !== undefined ? data.bestPair : "N/A"}
              </TableCell>
              <TableCell className="text-xs sm:text-sm md:text-lg lg:text-2xl">
                {data.worstPair !== undefined ? data.worstPair : "N/A"}
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
}
