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
import { useRouter } from "next/router";

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
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [loggedIn, setLi] = useState<string>("");
  const router = useRouter();
  useEffect(() => {
    async function getID() {
      const { li } = router.query;
      if (li !== undefined) {
        try {
          const user = await fetch("/api/auth/IDFromHash", {
            method: "POST",
            body: JSON.stringify(li),
            headers: { "Content-Type": "application/json" },
          });
          const lgdin = await user.json();
          console.log("logged in: ", lgdin);
          setLi(lgdin);
          tableData(selectedAccount, loggedIn);
        } catch (error) {
          console.error("Error fetching user: ", error);
        }
      }
    }
    getID();
  }, []);
  
  function tableData(selectedAccount: string, loggedIn: string){
    const reqBody = {
      loggedIn,
      selectedAccount
    }
    const response = await fetch("/api/entrymngmnt/searchEntries", {
      method: "POST",
      body: JSON.stringify(reqBody),
      headers: { "Content-Type": "application/json" },
    });
    const tradeData: TradeData[] = await response.json();
    console.log("Fetched data:", tradeData);
    setData(tradeData);
  }
  
  
  const handleAccountChange = async (selectedAccount: string) => {
    setSelectedAccount(selectedAccount);
  };

  return (
    <>
      <div className="flex-1 overflow-auto p-4 text-justify justify-center w-full">
        <h1 className="p-2 font-bold text-lg underline underline-offset-8">
          Search Entries
        </h1>
        {/* TODO: add a dropdown that selects the accounts available for the user logged in 
        use the accounts dd from TE page */}
        <Table className="bg-gray-400 rounded-2xl">
          <TableCaption className="text-gray-500">
            A Table of trades taken.
          </TableCaption>
          <TableHeader>
          <div className="p-3">
            <AccountDropdown
              onAccountChange={handleAccountChange}
            ></AccountDropdown>
          </div>
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
