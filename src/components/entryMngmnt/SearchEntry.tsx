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
import NotesModal from "./notesModal";

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

const SearchEntry: NextPage = () => {
  const [data, setData] = useState<TradeData[]>([]);

  async function tableData(account: number) {
    const response = await fetch("/api/entryManagement", {
      method: "POST",
      body: JSON.stringify(account),
      headers: { "Content-Type": "application/json" },
    });
    if (response.ok) {
      const tradeData: TradeData[] = await response.json();
      setData(tradeData);
    } else {
      throw new Error("Problem with API response");
    }
  }
  async function getID(account: string) {
    const ID = await fetch("/api/findActID", {
      method: "POST",
      body: JSON.stringify(account),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const response: number = await ID.json();
    return response;
  }
  const handleAccountChange = async (selAccount: string) => {
    const accountid = await getID(selAccount);
    tableData(accountid);
  };

  return (
    <>
      <div className="flex">
        <div className="flex flex-col m-3 mx-auto">
          <h3 className="text-xs sm:text-xs md:text-sm lg:text-lg">
            Select an account to search through
          </h3>
          <div className="pt-1 mt-4 m-2">
            <AccountDropdown
              onAccountChange={handleAccountChange}
            ></AccountDropdown>
          </div>
          <div className="flex flex-1 p-1 m-2">
            <Table className="bg-gray-400 rounded-2xl max-w-full">
              <TableCaption className="text-gray-500">
                A Table of trades taken.
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-slate-200 lg:text-xl md:text-lg sm:text-xs">
                    ID
                  </TableHead>
                  <TableHead className="text-slate-200 lg:text-xl md:text-lg sm:text-xs">
                    entry price
                  </TableHead>
                  <TableHead className="text-slate-200 lg:text-xl md:text-lg sm:text-xs">
                    stop loss
                  </TableHead>
                  <TableHead className="text-slate-200 lg:text-xl md:text-lg sm:text-xs">
                    take profit
                  </TableHead>
                  <TableHead className="text-slate-200 lg:text-xl md:text-lg sm:text-xs">
                    notes
                  </TableHead>
                  <TableHead className="text-slate-200 lg:text-xl md:text-lg sm:text-xs">
                    risk ratio
                  </TableHead>
                  <TableHead className="text-slate-200 lg:text-xl md:text-lg sm:text-xs">
                    outcome
                  </TableHead>
                  <TableHead className="text-slate-200 lg:text-xl md:text-lg sm:text-xs">
                    pair
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
                        {trade.entryprice}
                      </TableCell>
                      <TableCell className="lg:text-lg md:text-base sm:text-sm text-xs">
                        {trade.stoploss}
                      </TableCell>
                      <TableCell className="lg:text-lg md:text-base sm:text-sm text-xs">
                        {trade.takeprofit}
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
                      <TableCell className="lg:text-lg md:text-base sm:text-sm text-xs">
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
export default SearchEntry;
