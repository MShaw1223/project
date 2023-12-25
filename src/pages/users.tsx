//user page: created, switched and deleted

import { NextPage } from "next";
import Link from "next/link";
import { FaHome } from "react-icons/fa";

const userPage: NextPage = () => {
    return(
        <div className="flex flex-col flex-wrap items-center mt-5">
                <Link href="/home" className="p-3">
                    <FaHome className="h-5 w-5"></FaHome>
                </Link>
            <div className="text-center font-extrabold text-xl">
                <h1>User Page</h1>
                <p>This is where users will be deleted, switched, and created</p>
            </div>
        </div>
    )
}

export default userPage;