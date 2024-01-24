import { NextPage } from "next";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";

type TradeData = {
  tradesid: string;
  entryprice: number;
  stoploss: number;
  takeprofit: number;
  tradenotes: string;
  riskratio: number;
  winloss: string;
  currencypair: string;
};

const searchEntry: NextPage = () => {
  const [data, setData] = useState<TradeData[]>([]);

  useEffect(() => {
    async function fetchData() {
      const response = await fetch("/api/searchEntries");
      const tradeData: TradeData[] = await response.json();
      console.log("Fetched data:", tradeData);
      setData(tradeData);
    }
    fetchData();
  }, []);

  return (
    <>
      <div className="flex-1 overflow-auto p-4 text-justify justify-center w-full">
        <h1 className="p-2 font-bold text-lg underline underline-offset-8">
          Search Entries
        </h1>
        <Table className="bg-gray-400 rounded-2xl">
          <TableCaption className="text-gray-500">
            A Table of trades taken.
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="text-slate-200">Trade ID</TableHead>
              <TableHead className="text-slate-200">entryprice</TableHead>
              <TableHead className="text-slate-200">stoploss</TableHead>
              <TableHead className="text-slate-200">takeprofit</TableHead>
              <TableHead className="text-slate-200">tradenotes</TableHead>
              <TableHead className="text-slate-200">riskratio</TableHead>
              <TableHead className="text-slate-200">outcome</TableHead>
              <TableHead className="text-slate-200">currencypair</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((trade) => (
              <TableRow key={trade.tradesid}>
                <TableCell>{trade.tradesid}</TableCell>
                <TableCell>{trade.entryprice}</TableCell>
                <TableCell>{trade.stoploss}</TableCell>
                <TableCell>{trade.takeprofit}</TableCell>
                <TableCell>{trade.tradenotes}</TableCell>
                <TableCell>{trade.riskratio}</TableCell>
                <TableCell>{trade.winloss}</TableCell>
                <TableCell>{trade.currencypair}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
};
export default searchEntry;
