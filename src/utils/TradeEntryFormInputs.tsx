import { Input } from "@/components/ui/input";

export default function TEFormInputs() {
  return (
    <>
      <div className="flex">
        <div className="w-3/12 flex flex-col">
          <div className="p-3">
            <Input
              id="entryPrice"
              name="entryPrice"
              type="number"
              step="any"
              placeholder="Entry Price..."
            ></Input>
          </div>
          <div className="p-3">
            <Input
              id="stopLoss"
              name="stopLoss"
              type="number"
              step="any"
              placeholder="Stop Loss..."
            ></Input>
          </div>
          <div className="p-3">
            <Input
              id="takeProfit"
              name="takeProfit"
              type="number"
              step="any"
              placeholder="Take Profit..."
            ></Input>
          </div>
        </div>
        <div className="w-3/12 flex flex-col">
          <div className="p-3">
            <Input
              id="riskRatio"
              name="riskRatio"
              type="number"
              step="any"
              placeholder="Risk Ratio..."
            ></Input>
          </div>
        <div className="w-6/12 flex flex-col">
          <div className="p-3">
            <textarea
              id="tradeNotes"
              name="tradeNotes"
              placeholder=" Notes..."
              className="w-full h-[180px] resize-none border border-slate-200 text-sm"
            ></textarea>
          </div>
        </div>
      </div>
    </>
    )}
