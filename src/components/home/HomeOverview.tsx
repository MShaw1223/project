import { HomeData } from "@/pages/home";

type tableData = {
  data: HomeData;
};

export const TradeOverviewTile = ({ data }: tableData) => {
  return (
    <>
        <div className="min-w-56 md:w-1/2 lg:w-1/3 flex-grow rounded-2xl bg-black bg-opacity-85 p-2 text-left">
          <div className="mx-2 my-3 rounded-xl bg-gray-400 text-center">
            <h1 className="p-1 font-black">Account: {data.accountName}</h1>
          </div>
          <div className="mx-2 my-3 rounded-xl bg-gray-400">
            <h1 className="p-1">Number of Trades: {data.totalTrades}</h1>
            <h1 className="p-1">
              Win Percentage:{" "}
              {data.winPercentage !== undefined && data.winPercentage !== null
                ? `${data.winPercentage}%`
                : "0%"}
            </h1>
            <h1 className="p-1">
              Best Pair: {data.bestPair !== undefined ? data.bestPair : "N/A"}
            </h1>
            <h1 className="p-1">
              Worst Pair: {data.worstPair !== undefined ? data.worstPair : "N/A"}
            </h1>
          </div>
        </div>
    </>
  );
};
