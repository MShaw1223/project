import { NextPage } from "next";
import Link from "next/link";
import { FaHome } from "react-icons/fa";

 const accountManagement: NextPage = () =>{
    return(
        <div>
            <div>
            <Link href="/home">
              <FaHome></FaHome>
            </Link>
            </div>
            <div>
                <h1>Account Management</h1>
                <p>This is where there Accounts can be deleted, created, and deposited into</p>
            </div>
        </div>
    )
 }

 export default accountManagement;