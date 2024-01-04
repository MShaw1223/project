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
    <div className="w-80 h-screen bg-slate-400">
      <div className="text-center p-5 text-2xl font-extrabold">Menu</div>
      <Link href="/home">
        <div
          className={`flex pl-5 py-4 focus:outline-none font-bold hover:bg-slate-500 ${
            isLinkActive("/home") ? "bg-slate-600 hover:bg-slate-600" : ""
          } rounded-full `}
        >
          <FaHome className="w-8 h-8"></FaHome>
          <span className="ml-12 my-auto">Home</span>
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
          <BsFillJournalBookmarkFill className="w-8 h-8"></BsFillJournalBookmarkFill>
          <span className="ml-12 my-auto">Trade Entry</span>
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
          <FaCalculator className="w-8 h-8"></FaCalculator>
          <span className="ml-6">Entry Management</span>
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
          <MdOutlineAccountBalance className="w-8 h-8"></MdOutlineAccountBalance>
          <span className="ml-4">Account Management</span>
        </div>
      </Link>

      <Link href="/users">
        <div
          className={`flex pl-5 py-4 focus:outline-none font-bold hover:bg-slate-500 ${
            isLinkActive("/users") ? "bg-slate-600 hover:bg-slate-600" : ""
          } rounded-full `}
        >
          <FaUserFriends className="w-8 h-8"></FaUserFriends>
          <span className="ml-16">Users</span>
        </div>
      </Link>

      <Separator className="ml-9 my-7" />

      <Link href="/">
        <div className="flex pl-5 py-4 focus:outline-none hover:bg-slate-500 rounded-full">
          <MdArrowBack className="w-8 h-8"></MdArrowBack>
          <span className="ml-8 font-medium ">Back to Login</span>
        </div>
      </Link>
    </div>
  );
}
