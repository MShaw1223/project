import { NextPage } from "next";
import Menu from "@/utils/menu";
import { BsFillJournalBookmarkFill } from "react-icons/bs";
import { useState } from "react";
import AccountDropdown from "@/utils/tradeEntry/selectAccount";

const journal: NextPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  
  const handleAccountChange = (selectedAccount: string) => {
    setSelectedAccount(selectedAccount);
    if(setSelectedAccount !== ""){
      handler();
    }else{
      console.error("Error selecting account")
    }
  };

  const selected = selectedAccount;
async function handler() {
  const reponse = await fetch('/src/pages/api/journal/getInfo.ts',{
    method: "POST",
    content: JSON.stringify(selected),
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-cache"
  }),
  const tradeData = await reponse.json()
  return tradeData;
}

  return (
    <>
      <div className="flex h-screen bg-slate-200">
        <Menu isOpen={isOpen} setIsOpen={setIsOpen} />
        <div
          className={`flex-1 flex flex-col overflow-hidden ${
            isOpen ? "ml-20" : ""
          }`}
        >
          <div className="flex p-3 text-3xl">
            {/* <XYZ classname="w-10 h-10"> */}
            <BsFillJournalBookmarkFill />
            <span className="ml-4  font-bold">Journal</span>
          </div>
          <div className="flex-1 overflow-auto p-4 text-justify justify-center">
            <div className="p-3 m-2">
              <AccountDropdown>
              onAccountChange={handleAccountChange}
              </AccountDropdown>
            </div>
            <div>
              <p>{tradeData.tradeID}</p>
              <p>{tradeData.notes}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// i will need to use something similar to homesearch api --> style the json response into the tabs
// 

export default journal;
