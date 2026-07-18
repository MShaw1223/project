import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EntryInfoModal, NotesModal } from "./Modals";
import { TradeData } from "./SearchEntry";

export default function SearchTable({ data }: { data: TradeData[] }) {
  return (
    <>
      <Table className="bg-gray-400 w-[300px] sm:w-[400px] md:w-[500px] lg:w-[700px] rounded-2xl">
        <TableCaption className="text-gray-500">
          A Table of trades taken.
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="text-slate-200 text-xs lg:text-2xl md:text-lg sm:text-sm">
              TradeID
            </TableHead>
            <TableHead className="text-slate-200 text-xs lg:text-2xl md:text-lg sm:text-sm">
              Entry Details
            </TableHead>
            <TableHead className="text-slate-200 text-xs lg:text-2xl md:text-lg sm:text-sm">
              tradenotes
            </TableHead>
            <TableHead className="text-slate-200 text-xs lg:text-2xl md:text-lg sm:text-sm">
              riskratio
            </TableHead>
            <TableHead className="text-slate-200 text-xs lg:text-2xl md:text-lg sm:text-sm">
              outcome
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data &&
            data.map((trade) => (
              <TableRow key={trade.tradesid}>
                <TableCell className="lg:text-lg md:text-base sm:text-sm text-xs">
                  {trade.tradesid}
                </TableCell>
                <TableCell className="lg:text-lg md:text-base sm:text-sm text-xs">
                  <EntryInfoModal info={trade} />
                </TableCell>
                <TableCell className="lg:text-lg md:text-base sm:text-sm text-xs">
                  <NotesModal info={trade} />
                </TableCell>
                <TableCell className="lg:text-lg md:text-base sm:text-sm text-xs">
                  {trade.riskratio}
                </TableCell>
                <TableCell className="lg:text-lg md:text-base sm:text-sm text-xs">
                  {trade.winloss}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </>
  );
}
