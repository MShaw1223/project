import { NextPage } from "next";
import { FaHome } from "react-icons/fa";
import * as React from "react";
import { useRouter } from "next/router";
import withKey from "@/components/keyChecker";
import { TradeOverviewTile } from "@/components/home/HomeOverview";

export type HomeData = {
  accountName: string;
  totalTrades: number;
  winPercentage: number;
  bestPair: string;
  worstPair: string;
};

const Home: NextPage = () => {
  const router = useRouter();
  const [data, setData] = React.useState<HomeData[]>([]);
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
              body: JSON.stringify(loggedInVal),
              headers: { "Content-Type": "application/json" },
            });
            const tradeData: HomeData[] = await response.json();
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
      <title>FXTrax - Home</title>
      <div className="flex h-screen bg-slate-200">
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex justify-center p-3 text-3xl">
            <FaHome className="h-10 w-10" />
            <h1 className="m-1 font-bold">Home</h1>
          </div>
          <div className="mt-5 space-y-3 p-2 text-center">
            <h1 className="text-2xl font-extrabold sm:text-2xl md:text-3xl lg:text-4xl">
              {user ? `Welcome ${user}` : "..."}
            </h1>
          </div>
          <div className="mx-auto">
            <div className="flex flex-col sm:flex-row justify-center space-y-1 sm:space-x-1 sm:space-y-0">
              {user ? (
                data.map((d) => (
                  <TradeOverviewTile data={d} />
                ))
              ): "loading"}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default withKey(Home);
