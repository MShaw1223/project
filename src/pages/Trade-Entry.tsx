import { AccountDropdown } from "@/components/ui/selectAccount";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation } from "react-query"
import { useState, FormEvent } from "react";
import Link from "next/link";
import { FaHome } from "react-icons/fa";
import { NextPage } from "next";


const tradeEntry: NextPage = () => {
  const [selectedAccount, setSelectedAccount] = useState<string>('')
  
  const mutation = useMutation({
    mutationFn: async (formData: string) => {
      const response = await fetch("/api/entries",{
        method: "POST",
        body: formData,
        cache: 'no-store'
      })
      if (!response.ok) {
        throw new Error('Failed to submit trade data');
      }
      
      return response.json();
    },
    onSettled: () => {
      // Reset any state related to the mutation
      setSelectedAccount('');
    },
    onError: (error) => {
      console.error('Mutation error:', error);
    },
  })
  
  const handleAccountChange = (selectedAccount: string) => {
    setSelectedAccount(selectedAccount);
  };
  
  function handleSubmit(event: FormEvent<HTMLFormElement>){
    event.preventDefault()
    
    const data = new FormData(event.target as HTMLFormElement)
    const entryPrice = parseFloat(data.get("entryPrice")as string);
    const stopLoss = parseFloat(data.get("stopLoss")as string);
    const takeProfit = parseFloat(data.get("takeProfit")as string);
    const selectedAccountValue = selectedAccount;
    
    if(!entryPrice || !stopLoss || !takeProfit || selectedAccountValue === ''){
      alert("Invalid entry");
      return;
    }
    const requestData = JSON.stringify({
      entryPrice,
      stopLoss,
      takeProfit,
      selectedAccount: selectedAccountValue,
    });
    
    mutation.mutate(requestData);
  }
  
  
  return (
    <main className="text-center p-3 bg-slate-200 h-screen">
      <div className="flex flex-col items-center">
        <h1 className="m-4 text-4xl font-extrabold text-black">
          Trade Entry
        </h1>
        <div>
            <Link href="/home">
              <FaHome></FaHome>
            </Link>
        </div>
      </div>
      {mutation.isLoading && <p>Submitting Trade Data...</p>}
      {!mutation.isLoading && (
      <div className="flex flex-row flex-wrap">
        <div className="w-full">
          <div className="mx-auto my-auto">
            <AccountDropdown onAccountChange={handleAccountChange}></AccountDropdown>
          </div>
        </div>
        <div className="w-full md:w-1/2 lg:w-2/3 xl:w-3/4">
          <div className="flex flex-col items-center mx-auto">
            <form className="my-auto w-80" onSubmit={handleSubmit}>
              <div className="p-4">
                <Input id="entryPrice" name="entryPrice" type="number" step="any" placeholder="Entry Price..."></Input>
              </div>
              <div className="p-4">
                <Input id="stopLoss" name="stopLoss" type="number" step="any" placeholder="Stop Loss..."></Input>
              </div>
              <div className="p-4">
                <Input id="takeProfit" name="takeProfit" type="number" step="any" placeholder="Take Profit..."></Input>
              </div>
              <div className="p-4">
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

export default tradeEntry;