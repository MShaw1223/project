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

// import withAuth from "@/utils/authorise";
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
      console.log(loggedInVal);
      if (loggedInVal !== undefined) {
        try {
          const getuser = await fetch("/api/auth/userFromHash", {
            method: "POST",
            body: JSON.stringify(loggedInVal),
            headers: { "Content-Type": "application/json" },
          });
          const lgdin: string = await getuser.json();
          console.log("home.tsx lgdin: ", lgdin);
          setUser(lgdin);
          if (lgdin !== null) {
            const response = await fetch("/api/home/homeSearch", {
              method: "POST",
              body: JSON.stringify(lgdin),
              headers: { "Content-Type": "application/json" },
            });
            const tradeData: TradeData = await response.json();
            console.log("Fetched data:", tradeData);
            setData(tradeData);
          }
        } catch (error) {
          console.error("Error fetching user: ", error);
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
            <h1 className="text-2xl sm:text-2xl md:text-4xl font-extrabold">
              Welcome {user ? user : "..."}
            </h1>
          </div>
          <div className="flex flex-1 overflow-auto p-2 justify-center my-28 mx-auto">
            <Table className="bg-gray-400 w-[400px] sm:w-[310px] md:w-[400px] lg:w-[900px] rounded-2xl">
              <TableCaption className="text-gray-500">
                A Table of your recent Trades.
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-slate-200 lg:text-2xl md:text-lg sm:text-xs">
                    N<sup>o</sup> Trades
                  </TableHead>
                  <TableHead className="text-slate-200 lg:text-2xl md:text-lg sm:text-xs">
                    Trades Won
                  </TableHead>
                  <TableHead className="text-slate-200 lg:text-2xl md:text-lg sm:text-xs">
                    Win Rate
                  </TableHead>
                  <TableHead className="text-slate-200 lg:text-2xl md:text-lg sm:text-xs">
                    Best Pair
                  </TableHead>
                  <TableHead className="text-slate-200 lg:text-2xl md:text-lg sm:text-xs">
                    Worst Pair
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data && (
                  <TableRow>
                    <TableCell className="lg:text-2xl md:text-lg sm:text-xs">
                      {data.totalTrades}
                    </TableCell>
                    <TableCell className="lg:text-2xl md:text-lg sm:text-xs">
                      {data.totalWins}
                    </TableCell>
                    <TableCell className="lg:text-2xl md:text-lg sm:text-xs">
                      <TableCell className="lg:text-2xl md:text-lg sm:text-xs">
                        {data.winPercentage !== undefined
                          ? `${data.winPercentage}%`
                          : "No Data"}
                      </TableCell>
                    </TableCell>
                    <TableCell className="lg:text-2xl md:text-lg sm:text-xs">
                      {data.bestPair}
                    </TableCell>
                    <TableCell className="lg:text-2xl md:text-lg sm:text-xs">
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
