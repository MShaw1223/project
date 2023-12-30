import Link from "next/link";
import { FaCalculator, FaHome, FaUserFriends } from "react-icons/fa";
import { MdOutlineAccountBalance, MdOutlineManageSearch } from "react-icons/md";
import { BsFillJournalBookmarkFill } from "react-icons/bs";
import { MdArrowBack } from "react-icons/md";
import { useRouter } from "next/router";

export default function Menu() {
  const router = useRouter();
  const isLinkActive = (href: string) => router.pathname === href;
  return (
    <div className="w-80 h-screen bg-slate-500 font-extrabold">
      <div className="text-center p-5 text-2xl">Menu</div>

      <Link href="/home">
        <div
          className={`flex p-8 focus:outline-none ${
            isLinkActive("/home") ? "bg-gray-700" : ""
          } hover:bg-slate-400`}
        >
          <FaHome className="w-8 h-8"></FaHome>
          <span className="ml-12 my-auto">Home</span>
        </div>
      </Link>

      <Link href="/Trade-Entry">
        <div
          className={`flex p-8 focus:outline-none ${
            isLinkActive("/Trade-Entry") ? "bg-gray-700" : ""
          } hover:bg-slate-400`}
        >
          <BsFillJournalBookmarkFill className="w-8 h-8"></BsFillJournalBookmarkFill>
          <span className="ml-12 my-auto">Trade Entry</span>
        </div>
      </Link>

      <Link href="/entry-management">
        <div
          className={`flex p-8 focus:outline-none ${
            isLinkActive("/entry-management") ? "bg-gray-700" : ""
          } hover:bg-slate-400`}
        >
          <FaCalculator className="w-8 h-8"></FaCalculator>
          <span className="ml-6">Entry Management</span>
        </div>
      </Link>

      <Link href="/account-management">
        <div
          className={`flex p-8 focus:outline-none ${
            isLinkActive("/account-management") ? "bg-gray-700" : ""
          } hover:bg-slate-400`}
        >
          <MdOutlineAccountBalance className="w-8 h-8"></MdOutlineAccountBalance>
          <span className="ml-4">Account Management</span>
        </div>
      </Link>

      <Link href="/users">
        <div
          className={`flex p-8 focus:outline-none ${
            isLinkActive("/users") ? "bg-gray-700" : ""
          } hover:bg-slate-400`}
        >
          <FaUserFriends className="w-8 h-8"></FaUserFriends>
          <span className="ml-16">Users</span>
        </div>
      </Link>

      <Link href="/">
        <div className="flex p-8 focus:outline-none focus:bg-gray-700 hover:bg-slate-400">
          <MdArrowBack className="w-8 h-8"></MdArrowBack>
          <span className="ml-8">Return to login</span>
        </div>
      </Link>
    </div>
  );
}
