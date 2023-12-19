import { AccountDropdown } from "@/components/ui/selectAccount";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";
import { useMutation } from "react-query";
import { extractBody } from "@/utils/extractBody";
import { FormEvent } from "react";


export default function Home() {
  const router = useRouter()
  
  //issue with line 30, i have multiple inputs, could have submits
  //one after the other?

  const mutation = useMutation({
    mutationFn: (handle: string) => {
      return fetch("/api/pages",{
        method: "POST",
        body: JSON.stringify({ handle })
      })
    },
    onSuccess: async (res) => {
      const body = await extractBody(res);
      
      const entryPrice = body.entryPrice;
      router.push(`/${entryPrice}`);
      const stopLoss = body.stopLoss;
      router.push(`/${stopLoss}`);
      const takeProfit = body.takeProfit;
      router.push(`/${takeProfit}`);
    }
  })


  function handleSubmit(event: FormEvent<HTMLFormElement>){
    event.preventDefault()
    const data = new FormData(event.target as HTMLFormElement)
    const entryPrice = data.get("entryPrice")as string;
    const stopLoss = data.get("stopLoss")as string;
    const takeProfit = data.get("takeprofit")as string;
    if(!entryPrice || !stopLoss || !takeProfit)return
    mutation.mutate(entryPrice);
    mutation.mutate(stopLoss);
    mutation.mutate(takeProfit);
}


  return (
    <main className="text-centre p-3 bg-slate-200 h-screen">
      <div className="flex flex-col items-center">
        <h1 className="m-4 text-4xl font-extrabold text-black">
          Enter data
        </h1>
      </div>
      {mutation.isLoading && <p>Creating Page...</p>}
      {!mutation.isLoading && (
      <div className="flex flex-row my-20">
      <div className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4">
        <div className="ml-80 my-5">
          <AccountDropdown></AccountDropdown>
        </div>
      </div>
      <div className="w-full md:w-1/2 lg:w-2/3 xl:w-3/4">
        <div className="flex flex-col items-center mx-auto">
          <form className="my-auto w-80" onSubmit={handleSubmit}>
            <div className="p-5">
              <Input id="entryPrice" name="entryPrice" type="number" placeholder="Entry Price..."></Input>
            </div>
            <div className="p-5">
              <Input id="stopLoss" name="stopLoss" type="number" placeholder="Stop Loss..."></Input>
            </div>
            <div className="p-5">
              <Input id="takeProfit" name="takeProfit" type="number" placeholder="Take Profit..."></Input>
            </div>
            <div className="p-5">
              <Button type="submit">Submit Entry</Button>
            </div>
          </form>
        </div>
      </div>
    </div>    
      )}
    </main>
  )
}
