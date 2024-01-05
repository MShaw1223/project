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
    <div className="w-72 h-screen bg-slate-400">
      <div className="text-center p-5 text-2xl font-extrabold">Menu</div>
      <Link href="/home">
        <div
          className={`flex pl-5 py-4 focus:outline-none font-bold hover:bg-slate-500 ${
            isLinkActive("/home") ? "bg-slate-600 hover:bg-slate-600" : ""
          } rounded-full `}
        >
          <FaHome className="w-6 h-6"></FaHome>
          <span className="pl-3">Home</span>
        </div>
      </Link>

      <Link href="/Trade-Entry">
        <div
          className={`flex pl-5 py-4 focus:outline-none font-bold hover:bg-slate-500 ${
            isLinkActive("/Trade-Entry")
              ? "bg-slate-600 hover:bg-slate-600"
              : ""
          } rounded-full `}
        >
          <BsFillJournalBookmarkFill className="w-6 h-6"></BsFillJournalBookmarkFill>
          <span className="pl-3">Trade Entry</span>
        </div>
      </Link>

      <Link href="/entry-management">
        <div
          className={`flex pl-5 py-4 focus:outline-none font-bold hover:bg-slate-500 ${
            isLinkActive("/entry-management")
              ? "bg-slate-600 hover:bg-slate-600"
              : ""
          } rounded-full `}
        >
          <FaCalculator className="w-6 h-6"></FaCalculator>
          <span className="pl-3">Entry Management</span>
        </div>
      </Link>

      <Link href="/account-management">
        <div
          className={`flex pl-5 py-4 focus:outline-none font-bold hover:bg-slate-500 ${
            isLinkActive("/account-management")
              ? "bg-slate-600 hover:bg-slate-600"
              : ""
          } rounded-full`}
        >
          <MdOutlineAccountBalance className="w-6 h-6"></MdOutlineAccountBalance>
          <span className="pl-3">Account Management</span>
        </div>
      </Link>

      <Link href="/users">
        <div
          className={`flex pl-5 py-4 focus:outline-none font-bold hover:bg-slate-500 ${
            isLinkActive("/users") ? "bg-slate-600 hover:bg-slate-600" : ""
          } rounded-full `}
        >
          <FaUserFriends className="w-6 h-6"></FaUserFriends>
          <span className="pl-3">Users</span>
        </div>
      </Link>

      <Separator className="ml-9 my-7" />

      <Link href="/">
        <div className="flex pl-5 py-4 focus:outline-none font-bold hover:bg-slate-500 rounded-full">
          <MdArrowBack className="w-6 h-6"></MdArrowBack>
          <span className="pl-3">Back to Login</span>
        </div>
      </Link>
    </div>
  );
}
