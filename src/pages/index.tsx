import { AccountDropdown } from "@/components/ui/selectAccount";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";
import { useMutation } from "react-query"
import { useState, FormEvent } from "react";


export default function Home() {
  const router = useRouter()

  const [selectedAccount, setSelectedAccount] = useState<string>('')

  const mutation = useMutation({
    mutationFn: async (formData: string) => {
      const response = await fetch("/api/entries",{
        method: "POST",
        body: formData
         })
         return response.json();
    },
    /*onSuccess: (data) => {

      const a = data;
      const b = data;
      const c = data;
      const composite = `/${a}/${b}/${c}`;

      router.push(composite);
    } this is useful to redirect to a new url after a 
    process is successfully carried out. 
    If its many things to move thru then use a composite for router.push()
    Else just use the router.push(`${xyzabc}`)
    */
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

    if(!entryPrice || !stopLoss || !takeProfit || !selectedAccountValue){
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
          Trade Entry - Prototype
        </h1>
        <p className="font-light">
          Enter a trade, with the entry fields being up to 7 digits long (ie 1,234,567),<br />
          with up to 7 decimal places (ie 1,234,567.1234567). <br />
          Entries <strong className="font-bold">MUST</strong> fall between 0.0000001 and 9999999.9999999. <br />
        </p>
      </div>
      {mutation.isLoading && <p>Submitting Trade Data...</p>}
      {!mutation.isLoading && (
      <div className="flex flex-row my-20">
      <div className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4">
        <div className="ml-80 my-5">
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
