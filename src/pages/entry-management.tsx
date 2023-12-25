import { NextPage } from "next";
import Link from "next/link";
import { FaHome } from "react-icons/fa";

const EntryManagement: NextPage = () => {
    return(
        <div className="flex flex-col flex-wrap justify-center">
            <div className="p-3">
                <Link href="/home">
                    <FaHome></FaHome>
                </Link>
            </div>
            <div className="text-center font-extrabold text-xl">
                <h1>Entry Management</h1>
                <p>This is where there will be trades searched for, deleted & edited</p>
            </div>
        </div>
    )
}

export default EntryManagement;