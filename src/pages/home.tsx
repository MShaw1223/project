import { NextPage } from "next";
import Link from "next/link";
import { FaCalculator } from "react-icons/fa";
import { MdOutlineManageSearch } from "react-icons/md";
import { FaUserFriends } from "react-icons/fa";
import { MdOutlineAccountBalance } from "react-icons/md";


const Home: NextPage = () => {
    //make a menu.ts file on utils? as the dropdown will be on all pages
    return(
    <div className="text-center h-screen bg-slate-100 mx-auto my-auto">
        <h1 className="text-4xl font-black p-8">
          Trade Application - Home
        </h1>
        <p className="p-2">
            The links here are going to be moved to the dropdown that will be on the right <br />
            A table will be shown below of all the trades
        </p>
        <div className="flex justify-center">
            <h1 className="text-2xl font-black p-2">Trade Entry Page</h1>
            <Link href="/trade-entry" >
              <FaCalculator className="w-10 h-10"></FaCalculator> 
            </Link>
        </div>
        
        <div className="flex justify-center">
            <h1 className="text-2xl font-black p-2">Entry Management Page</h1>
            <Link href="/entry-management" >
                <MdOutlineManageSearch className="w-10 h-10"></MdOutlineManageSearch>
            </Link>
        </div>
        
        <div className="flex justify-center">
            <h1 className="text-2xl font-black p-2">Account Management Page</h1>
            <Link href="/account-management" >
                <MdOutlineAccountBalance className="w-10 h-10"></MdOutlineAccountBalance>
            </Link>
        </div>
        
        <div className="flex justify-center">
            <h1 className="text-2xl font-black p-2">Users Page</h1>
            <Link href="/users" >
                <FaUserFriends className="w-10 h-10"></FaUserFriends>
            </Link>
        </div>
    </div>
    )
}
export default Home;