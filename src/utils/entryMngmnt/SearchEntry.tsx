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
  tradedata: string;
};

const searchEntry: NextPage = () => {
  const [data, setData] = useState<TradeData | null>(null);

  useEffect(() => {
    async function fetchData() {
      const response = await fetch("/api/searchEntries");
      const tradeData = await response.json();
      console.log("Fetched data:", tradeData);
      setData(tradeData);
    }
    fetchData();
  }, []);

  return (
    <>
      <div className="flex-1 overflow-auto p-4 text-justify justify-center">
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
              <TableHead className="text-slate-200">winloss</TableHead>
              <TableHead className="text-slate-200">currencypair</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>a</TableCell>
              <TableCell>b</TableCell>
              <TableCell>c</TableCell>
              <TableCell>d</TableCell>
              <TableCell>e</TableCell>
              <TableCell>f</TableCell>
              <TableCell>g</TableCell>
              <TableCell>h</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </>
  );
};
export default searchEntry;
