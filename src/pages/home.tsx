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
  const [data, setData] = React.useState<TradeData | null>(null);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [user, setUser] = React.useState<string>(null);
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
          const lgdin = await getuser.json();
          setUser(lgdin);
          console.log("logged in: ", user);
          if (user !== null) {
            const response = await fetch("/api/home/homeSearch", {
              method: "POST",
              body: JSON.stringify(user),
              headers: { "Content-Type": "application/json" },
            });
            const tradeData = await response.json();
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
        <div
          className={`flex-1 flex flex-col overflow-hidden ${
            menuOpen ? "ml-20" : ""
          }`}
        >
          <div className="flex p-3 text-3xl">
            <FaHome className="h-10 w-10"></FaHome>
            <span className="ml-4 my-auto font-bold">Home</span>
          </div>
          <div className="p-2 mt-5 mx-5">
            <h1 className="text-3xl font-extrabold">
              Welcome {user ? user : "..."}
            </h1>
          </div>
          <div className="flex flex-1 overflow-auto p-4">
            <Table className="bg-gray-400 rounded-2xl">
              <TableCaption className="text-gray-500">
                A Table of your recent Trades.
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-slate-200 p-5 text-lg">
                    Trades Taken
                  </TableHead>
                  <TableHead className="text-slate-200 p-5 text-lg">
                    Winning Trades
                  </TableHead>
                  <TableHead className="text-slate-200 p-5 text-lg">
                    Win %
                  </TableHead>
                  <TableHead className="text-slate-200 p-5 text-lg">
                    Best Pair
                  </TableHead>
                  <TableHead className="text-slate-200 p-5 text-lg">
                    Worst Pair
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data && (
                  <TableRow>
                    <TableCell className="p-5 text-lg">
                      {data.totalTrades}
                    </TableCell>
                    <TableCell className="p-5 text-lg">
                      {data.totalWins}
                    </TableCell>
                    <TableCell className="p-5 text-lg">{`${data.winPercentage}%`}</TableCell>
                    <TableCell className="p-5 text-lg">
                      {data.bestPair}
                    </TableCell>
                    <TableCell className="p-5 text-lg">
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
