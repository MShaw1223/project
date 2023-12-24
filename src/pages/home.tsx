import { NextPage } from "next";
import Link from "next/link";
import { FaCalculator } from "react-icons/fa";
import { MdOutlineManageSearch } from "react-icons/md";
import { FaUserFriends } from "react-icons/fa";
import { MdOutlineAccountBalance } from "react-icons/md";
import Menu from "@/utils/menu";


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
        <Menu/>
    </div>
    )
}
export default Home;