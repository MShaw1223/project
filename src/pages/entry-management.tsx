import { NextPage } from "next";
import Link from "next/link";
import { FaHome } from "react-icons/fa";

const EntryManagement: NextPage = () => {
    return(
        <div className="flex flex-col flex-wrap items-center mt-5">
                <Link href="/home" className="p-3">
                    <FaHome className="h-5 w-5"></FaHome>
                </Link>
            <div className="text-center font-extrabold text-xl">
                <h1>Entry Management</h1>
                <p>This is where there will be trades searched for, deleted & edited</p>
            </div>
        </div>
    )
}

export default EntryManagement;