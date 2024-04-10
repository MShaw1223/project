import { NextPage } from "next";
import Menu from "@/utils/menu";
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
import * as React from "react";
import { useRouter } from "next/router";
import withAuth from "@/utils/protection/authorise";

type TradeData = {
  totalTrades: number;
  totalWins: number;
  winPercentage: number;
  bestPair: string;
  worstPair: string;
};

const Home: NextPage = () => {
  const router = useRouter();
  const [data, setData] = React.useState<TradeData>();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [user, setUser] = React.useState<string>("");
  React.useEffect(() => {
    async function getUser() {
      const { li: loggedInVal } = router.query;
      if (loggedInVal !== undefined) {
        try {
          const getuser = await fetch("/api/auth/userFromHash", {
            method: "POST",
            body: JSON.stringify(loggedInVal),
            headers: { "Content-Type": "application/json" },
          });
          const lgdin: string = await getuser.json();
          setUser(lgdin);
          if (lgdin !== null) {
            const response = await fetch("/api/home", {
              method: "POST",
              body: JSON.stringify(lgdin),
              headers: { "Content-Type": "application/json" },
            });
            const tradeData: TradeData = await response.json();
            setData(tradeData);
          }
        } catch (error) {
          alert("Error fetching user");
          return;
        }
      }
    }
    getUser();
  }, []);

  return (
    <>
      <div className="flex h-screen bg-slate-200">
        <Menu isOpen={menuOpen} setIsOpen={setMenuOpen} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex p-3 text-3xl justify-center">
            <FaHome className="h-10 w-10"></FaHome>
            <span className="my-auto font-bold">Home</span>
          </div>
          <div className="p-2 mt-5 mx-5 text-center">
            <h1 className="text-2xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold">
              Welcome {user ? user : "..."}
            </h1>
          </div>
          <div className="flex flex-1 overflow-auto p-1 justify-center mx-auto">
            <Table className="bg-gray-400 w-[300px] sm:w-[400px] md:w-[600px] lg:w-[900px] rounded-2xl">
              <TableCaption className="text-gray-500">
                A Table of your recent Trades.
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-slate-200 text-xs lg:text-2xl md:text-lg sm:text-sm">
                    N<sup>o</sup> Trades
                  </TableHead>
                  <TableHead className="text-slate-200 text-xs lg:text-2xl md:text-lg sm:text-sm">
                    Winners
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
                {data && (
                  <TableRow>
                    <TableCell className="text-xs lg:text-2xl md:text-lg sm:text-sm">
                      {data.totalTrades}
                    </TableCell>
                    <TableCell className="text-xs lg:text-2xl md:text-lg sm:text-sm">
                      {data.totalWins}
                    </TableCell>
                    <TableCell className="text-xs lg:text-2xl md:text-lg sm:text-sm">
                      <TableCell className="text-xs lg:text-2xl md:text-lg sm:text-sm">
                        {data.winPercentage !== undefined
                          ? `${data.winPercentage}%`
                          : "No Data"}
                      </TableCell>
                    </TableCell>
                    <TableCell className="text-xs lg:text-2xl md:text-lg sm:text-sm">
                      {data.bestPair}
                    </TableCell>
                    <TableCell className="text-xs lg:text-2xl md:text-lg sm:text-sm">
                      {data.worstPair}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </>
  );
};
export default withAuth(Home);
