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
      <div className="flex">
        <div className="m-3 overflow-hidden text-left mx-auto">
          <h3>Select an account to search through</h3>
          <div className="p-1 my-4">
            <AccountDropdown
              onAccountChange={handleAccountChange}
            ></AccountDropdown>
          </div>
          <div className="flex-1 overflow-auto p-2 text-center m-2">
            <h3 className="text-slate-700">
              Tip: Right click to copy the trade ID you would like to delete and
              paste it into the input on the delete entry tab
            </h3>
            <Table className="bg-gray-400 w-[400px] sm:w-[310px] md:w-[400px] lg:w-[910] rounded-2xl">
              <TableCaption className="text-gray-500">
                A Table of trades taken.
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-slate-200 lg:text-2xl md:text-lg sm:text-xs">
                    Trade ID
                  </TableHead>
                  <TableHead className="text-slate-200 lg:text-2xl md:text-lg sm:text-xs">
                    entryprice
                  </TableHead>
                  <TableHead className="text-slate-200 lg:text-2xl md:text-lg sm:text-xs">
                    stoploss
                  </TableHead>
                  <TableHead className="text-slate-200 lg:text-2xl md:text-lg sm:text-xs">
                    takeprofit
                  </TableHead>
                  <TableHead className="text-slate-200 lg:text-2xl md:text-lg sm:text-xs">
                    tradenotes
                  </TableHead>
                  <TableHead className="text-slate-200 lg:text-2xl md:text-lg sm:text-xs">
                    riskratio
                  </TableHead>
                  <TableHead className="text-slate-200 lg:text-2xl md:text-lg sm:text-xs">
                    outcome
                  </TableHead>
                  <TableHead className="text-slate-200 lg:text-2xl md:text-lg sm:text-xs">
                    currencypair
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((trade) => (
                  <TableRow key={trade.tradesid}>
                    <TableCell className="lg:text-2xl md:text-lg sm:text-xs">
                      {trade.tradesid}
                    </TableCell>
                    <TableCell className="lg:text-2xl md:text-lg sm:text-xs">
                      {trade.entryprice}
                    </TableCell>
                    <TableCell className="lg:text-2xl md:text-lg sm:text-xs">
                      {trade.stoploss}
                    </TableCell>
                    <TableCell className="lg:text-2xl md:text-lg sm:text-xs">
                      {trade.takeprofit}
                    </TableCell>
                    <TableCell className="lg:text-2xl md:text-lg sm:text-xs">
                      {trade.tradenotes}
                    </TableCell>
                    <TableCell className="lg:text-2xl md:text-lg sm:text-xs">
                      {trade.riskratio}
                    </TableCell>
                    <TableCell className="lg:text-2xl md:text-lg sm:text-xs">
                      {trade.winloss}
                    </TableCell>
                    <TableCell className="lg:text-2xl md:text-lg sm:text-xs">
                      {trade.currencypair}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </>
  );
};
export default searchEntry;
