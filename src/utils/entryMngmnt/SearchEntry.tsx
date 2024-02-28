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
import { useState } from "react";
import AccountDropdown from "../selectAccount";

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

  async function tableData(account: string) {
    console.log("Account: ", account);
    const response = await fetch("/api/entrymngmnt/searchEntries", {
      method: "POST",
      body: JSON.stringify(account),
      headers: { "Content-Type": "application/json" },
    });
    console.log("response from searchEntries: ", response);
    if (response.ok) {
      const tradeData: TradeData[] = await response.json();
      console.log("Fetched data: ", tradeData);
      setData(tradeData);
    } else {
      throw new Error("Problem with API response");
    }
  }
  async function getID(account: string) {
    const ID = await fetch("/api/tradeEntry/findActID", {
      method: "POST",
      body: JSON.stringify(account),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const response = await ID.json();
    return response;
  }
  const handleAccountChange = async (selAccount: string) => {
    console.log("Selected Account: ", selAccount);
    const accountid = await getID(selAccount);
    tableData(accountid);
  };

  return (
    <>
      <div className="flex-1 overflow-auto p-4 text-justify justify-center w-full">
        <h1 className="p-2 font-bold text-lg underline underline-offset-8">
          Search Entries
        </h1>
        <div className="p-1 m1">
          <AccountDropdown
            onAccountChange={handleAccountChange}
          ></AccountDropdown>
        </div>
        <Table className="bg-gray-400 rounded-2xl p-1 m-1">
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
