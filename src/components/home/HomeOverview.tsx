import { HomeData } from "@/pages/home";

type tableData = {
  data: HomeData[];
};

export const TradeOverview = ({ data }: tableData) => {
  return (
    <>
      {data.map((d) => (
        <div className="min-w-56 max-w-[33.333333%] flex-wrap rounded-2xl bg-black bg-opacity-85 p-2 text-left">
          <div className="mx-2 my-3 flex-grow rounded-xl bg-gray-400 text-center">
            <h1 className="p-1 font-black">Account: {d.accountName}</h1>
          </div>
          <div className="mx-2 my-3 rounded-xl bg-gray-400">
            <h1 className="p-1">Number of Trades: {d.totalTrades}</h1>
            <h1 className="p-1">
              Win Percentage:{" "}
              {d.winPercentage !== undefined && d.winPercentage !== null
                ? `${d.winPercentage}%`
                : "0%"}
            </h1>
            <h1 className="p-1">
              Best Pair: {d.bestPair !== undefined ? d.bestPair : "N/A"}
            </h1>
            <h1 className="p-1">
              Worst Pair: {d.worstPair !== undefined ? d.worstPair : "N/A"}
            </h1>
          </div>
        </div>
      ))}
    </>
  );
};
