import Link from "next/link";
import { FaCalculator, FaHome, FaUserFriends } from "react-icons/fa";
import { MdOutlineAccountBalance, MdOutlineManageSearch } from "react-icons/md";
import { BsFillJournalBookmarkFill } from "react-icons/bs";
import { MdArrowBack } from "react-icons/md";
import { useRouter } from "next/router";
import { Separator } from "@/components/ui/separator";

export default function Menu() {
  const router = useRouter();
  const isLinkActive = (href: string) => router.pathname === href;
  return (
    <div className="w-[300px] h-screen bg-black">
      <div className="text-center p-5 text-2xl font-sans font-semibold text-slate-100">
        Menu
      </div>
      <Link href="/home">
        <div
          className={`flex pl-5 py-4 mx-3 focus:outline-none font-bold hover:bg-slate-500 ${
            isLinkActive("/home") ? "bg-slate-600 hover:bg-slate-600" : ""
          } rounded-full `}
        >
          <FaHome className="w-6 h-6 text-slate-100"></FaHome>
          <span className="pl-3 text-slate-100">Home</span>
        </div>
      </Link>

      <Link href="/Trade-Entry">
        <div
          className={`flex pl-5 py-4 mx-3 focus:outline-none font-bold hover:bg-slate-500 ${
            isLinkActive("/Trade-Entry")
              ? "bg-slate-600 hover:bg-slate-600"
              : ""
          } rounded-full `}
        >
          <BsFillJournalBookmarkFill className="w-6 h-6 text-slate-100"></BsFillJournalBookmarkFill>
          <span className="pl-3 text-slate-100">Trade Entry</span>
        </div>
      </Link>

      <Link href="/entry-management">
        <div
          className={`flex pl-5 py-4 mx-3 focus:outline-none font-bold hover:bg-slate-500 ${
            isLinkActive("/entry-management")
              ? "bg-slate-600 hover:bg-slate-600"
              : ""
          } rounded-full `}
        >
          <FaCalculator className="w-6 h-6 text-slate-100"></FaCalculator>
          <span className="pl-3 text-slate-100">Entry Management</span>
        </div>
      </Link>

      <Link href="/account-management">
        <div
          className={`flex pl-5 py-4 mx-3 focus:outline-none font-bold hover:bg-slate-500 ${
            isLinkActive("/account-management")
              ? "bg-slate-600 hover:bg-slate-600"
              : ""
          } rounded-full`}
        >
          <MdOutlineAccountBalance className="w-6 h-6 text-slate-100"></MdOutlineAccountBalance>
          <span className="pl-3 text-slate-100">Account Management</span>
        </div>
      </Link>

      <Link href="/users">
        <div
          className={`flex pl-5 py-4 mx-3 focus:outline-none font-bold hover:bg-slate-500 ${
            isLinkActive("/users") ? "bg-gray-700 hover:bg-gray-700" : ""
          } rounded-full `}
        >
          <FaUserFriends className="w-6 h-6 text-slate-100"></FaUserFriends>
          <span className="pl-3 text-slate-100">Users</span>
        </div>
      </Link>

      <Separator className="ml-9 my-7 bg-white" />

      <Link href="/">
        <div className="flex pl-5 py-4 mx-3 focus:outline-none font-bold hover:bg-slate-500 rounded-full">
          <MdArrowBack className="w-6 h-6 text-slate-100"></MdArrowBack>
          <span className="pl-3 text-slate-100">Back to Login</span>
        </div>
      </Link>
    </div>
  );
}
