import { NextPage } from "next";
import { useState } from "react";
import AccountDropdown from "../selectAccount";
import SearchTable from "./searchTable";

export type TradeData = {
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
        <div className="text-left mx-auto">
          <h3 className="m-3 text-xs sm:text-xs md:text-sm lg:text-lg">
            Select an account to search through
          </h3>
          <div>
            <AccountDropdown
              onAccountChange={handleAccountChange}
            ></AccountDropdown>
          </div>
          <div className="flex-1 p-1 text-center m-1">
            <SearchTable data={data} />
          </div>
        </div>
      </div>
    </>
  );
};
export default SearchEntry;
