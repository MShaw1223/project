import { NextPage } from "next";
import Link from "next/link";
import { FaHome } from "react-icons/fa";

 const accountManagement: NextPage = () =>{
    return(
        <div className="flex flex-col flex-wrap justify-center">
            <div className="p-3">
                <Link href="/home">
                    <FaHome></FaHome>
                </Link>
            </div>
            <div className="text-center font-extrabold text-xl">
                <h1>Account Management</h1>
                <p>This is where there Accounts can be deleted, created, and deposited into</p>
            </div>
        </div>
    )
 }

export default accountManagement;