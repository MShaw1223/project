import Link from "next/link";
import { FaCalculator, FaUserFriends } from "react-icons/fa";
import { MdOutlineAccountBalance, MdOutlineManageSearch } from "react-icons/md";

export default function Menu(){
    //change the padding between divs
    return(
        <div className="p-3">
            <div className="flex justify-center p-2">
                <h1 className="text-2xl font-black p-2">Trade Entry Page</h1>
                <Link href="/Trade-Entry" >
                    <FaCalculator className="w-10 h-10"></FaCalculator> 
                </Link>
            </div>
            
            <div className="flex justify-center p-2">
                <h1 className="text-2xl font-black p-2">Entry Management Page</h1>
                <Link href="/entry-management" >
                    <MdOutlineManageSearch className="w-10 h-10"></MdOutlineManageSearch>
                </Link>
            </div>
            
            <div className="flex justify-center p-2">
                <h1 className="text-2xl font-black p-2">Account Management Page</h1>
                <Link href="/account-management" >
                    <MdOutlineAccountBalance className="w-10 h-10"></MdOutlineAccountBalance>
                </Link>
            </div>
            
            <div className="flex justify-center p-2">
                <h1 className="text-2xl font-black p-2">Users Page</h1>
                <Link href="/users" >
                    <FaUserFriends className="w-10 h-10"></FaUserFriends>
                </Link>
            </div>
        </div>
    )
}