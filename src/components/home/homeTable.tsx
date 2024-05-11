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

export default function HomeTable({ data }: { data: HomeData[] }) {
  return (
    <Table className="bg-gray-400 w-[300px] sm:w-[400px] md:w-[500px] lg:w-[700px] rounded-2xl">
      <TableCaption className="text-gray-500">
        A Table of your recent Trades
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="text-slate-200 text-xs lg:text-2xl md:text-lg sm:text-sm">
            Account ID
          </TableHead>
          <TableHead className="text-slate-200 text-xs lg:text-2xl md:text-lg sm:text-sm">
            N<sup>o</sup> Trades
          </TableHead>
          <TableHead className="text-slate-200 text-xs lg:text-2xl md:text-lg sm:text-sm">
            Wins
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
            <TableRow>
              <TableCell className="text-xs lg:text-2xl md:text-lg sm:text-sm">
                {data.accountid !== undefined ? data.accountid : "0"}
              </TableCell>
              <TableCell className="text-xs lg:text-2xl md:text-lg sm:text-sm">
                {data.totalTrades !== undefined ? data.totalTrades : "0"}
              </TableCell>
              <TableCell className="text-xs lg:text-2xl md:text-lg sm:text-sm">
                {data.totalWins !== undefined ? data.totalWins : "0"}
              </TableCell>
              <TableCell className="text-xs lg:text-2xl md:text-lg sm:text-sm">
                <TableCell className="text-xs lg:text-2xl md:text-lg sm:text-sm">
                  {data.winPercentage !== undefined &&
                  data.winPercentage !== null
                    ? `${data.winPercentage}%`
                    : "0%"}
                </TableCell>
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
