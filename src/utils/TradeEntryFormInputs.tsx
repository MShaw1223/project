import { Input } from "@/components/ui/input";

export default function TEFormInputs() {
  return (
    <>
      <div className="flex">
        <div className="flex-1 flex flex-col">
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
        <div className="flex-1 flex flex-col">
          <div className="p-3">
            <Input
              id="riskRatio"
              name="riskRatio"
              type="number"
              step="any"
              placeholder="Risk Ratio..."
            ></Input>
          </div>
        </div>
        <div className="flex-1 flex flex-col">
          <div className="p-3">
            <Input
              id="currencyPair"
              name="currencyPair"
              type="string"
              placeholder="Currency Pair..."
            ></Input>
          </div>
          <div className="p-3">
            <Input
              id="tradeNotes"
              name="tradeNotes"
              type="text"
              placeholder="Notes..."
            ></Input>
          </div>
        </div>
      </div>
    </>
  );
}
