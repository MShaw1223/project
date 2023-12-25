//user page: created, switched and deleted
"use client"
 
import DeleteUser from "@/components/ui/DeleteUser";
import ProfileCreate from "@/components/ui/ProfileCreate";
import { NextPage } from "next";
import Link from "next/link";
import { FaHome } from "react-icons/fa";
import { Separator } from "@/components/ui/separator"
import EditUser from "@/components/ui/EditUser";


const userPage: NextPage = () => {
    return(
        <div className="flex flex-col flex-wrap items-center mt-3">
                <h1 className="text-center font-extrabold text-xl">User Page</h1>
                <Link href="/home" className="p-3">
                    <FaHome className="h-5 w-5"></FaHome>
                </Link>
                
                <div className="border-2 border-double p-2 m-4 w-10/12">
                    <ProfileCreate/>
                </div>
                <Separator className="w-3/4"/>

                <div className="border-2 border-double p-2 m-4 w-10/12">
                    <DeleteUser/>
                </div>
                <Separator className="w-3/4"/>

                <div className="border-2 border-double p-2 m-4 w-10/12">
                    <EditUser/>
                </div>
        </div>
    )
}
export default userPage;