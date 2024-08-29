import { NextPage } from "next";
import { FaHome } from "react-icons/fa";
import * as React from "react";
import { useRouter } from "next/router";
import withAuth from "@/components/authorise";
import HomeTable from "@/components/home/homeTable";

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
      <div className="flex h-screen bg-slate-200">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex p-3 text-3xl justify-center">
            <FaHome className="h-10 w-10" />
            <h1 className="m-1 font-bold">Home</h1>
          </div>
          <div className="p-2 mt-5 text-center">
            <h1 className="text-2xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold">
              {user ? `Welcome ${user}` : "..."}
            </h1>
          </div>
          <div className="mx-auto">
            {user ? <HomeTable data={data} /> : "loading"}
          </div>
        </div>
      </div>
    </>
  );
};
export default withAuth(Home);
