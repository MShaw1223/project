import { useRouter } from "next/router";
import { FormEvent } from "react";
import { useMutation } from "react-query";
import { extractBody } from "./extractBody";

const router = useRouter()

export const mutation = useMutation({
    mutationFn: (handle: string) => {
      return fetch("/api/pages",{
        method: "POST",
        body: JSON.stringify({ handle })
      })
    },
    onSuccess: async (res) => {
      const body = await extractBody(res);
      const handle = body.handle;
      router.push(`/${handle}`);
    }
  })

export function handleSubmit(event: FormEvent<HTMLFormElement>){
    event.preventDefault()
    const entryPricedata = new FormData(event.target as HTMLFormElement)
    const entryPrice = entryPricedata.get("entryPrice")as string;
    if(!entryPrice)return
    mutation.mutate(entryPrice);
    
    const stopLossdata = new FormData(event.target as HTMLFormElement)
    const stopLoss = stopLossdata.get("stopLoss")as string;
    if(!stopLoss)return
    mutation.mutate(stopLoss);
   
    const takeProfitdata = new FormData(event.target as HTMLFormElement)
    const takeProfit = takeProfitdata.get("takeProfit")as string;
    if(!takeProfit)return
    mutation.mutate(takeProfit);
}

