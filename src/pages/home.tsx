import { NextPage } from "next";
import Menu from "@/components/ui/menu";
import { FaHome } from "react-icons/fa";
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
  totalTrades: number;
  totalWins: number;
  winPercentage: number;
  bestPair: string;
  worstPair: string;
};

const Home: NextPage = () => {
  const [data, setData] = useState<TradeData | null>(null);

  // Fetch data from the database
  useEffect(() => {
    async function fetchData() {
      const response = await fetch("/api/homeSearch");
      const tradeData: TradeData = await response.json();
      console.log("Fetched data:", tradeData);
      setData(tradeData);
    }

    fetchData();
  }, []);
  return (
    <div className="flex h-screen bg-slate-200">
      <Menu />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex p-3 text-3xl">
          <FaHome className="h-10 w-10"></FaHome>
          <span className="ml-4 my-auto font-bold">Home</span>
        </div>
        <div className="flex-1 overflow-auto p-4 text-justify justify-center">
          <Table className="bg-gray-400 rounded-2xl">
            <TableCaption className="text-gray-500">
              A Table of your recent Trades.
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="text-slate-200">Trades Taken</TableHead>
                <TableHead className="text-slate-200">Winning Trades</TableHead>
                <TableHead className="text-slate-200">Win %</TableHead>
                <TableHead className="text-slate-200">Best Pair</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data && (
                <TableRow>
                  <TableCell>{data.totalTrades}</TableCell>
                  <TableCell>{data.totalWins}</TableCell>
                  <TableCell>{`${data.winPercentage}%`}</TableCell>
                  <TableCell>{data.bestPair}</TableCell>
                  <TableCell>{data.worstPair}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
export default Home;
