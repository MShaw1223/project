import Link from "next/link";
import { FaCalculator, FaUserFriends } from "react-icons/fa";
import { MdOutlineAccountBalance, MdOutlineManageSearch } from "react-icons/md";
import { BsFillJournalBookmarkFill } from "react-icons/bs";
import { MdArrowBack } from "react-icons/md";

export default function Menu() {
  return (
    <div className="w-80 h-screen bg-slate-500 font-extrabold">
      <Link href="/Trade-Entry">
        <div className="flex p-8 focus:outline-none focus:bg-gray-700 hover:bg-slate-400 mt-16 mb-10">
          <BsFillJournalBookmarkFill className="w-8 h-8"></BsFillJournalBookmarkFill>
          <span className="ml-12 my-auto">Trade Entry</span>
        </div>
      </Link>

      <Link href="/entry-management">
        <div className="flex p-8 focus:outline-none focus:bg-gray-700 hover:bg-slate-400 mb-10">
          <FaCalculator className="w-8 h-8"></FaCalculator>
          <span className="ml-6">Entry Management</span>
        </div>
      </Link>

      <Link href="/account-management">
        <div className="flex p-8 focus:outline-none focus:bg-gray-700 hover:bg-slate-400 mb-10">
          <MdOutlineAccountBalance className="w-8 h-8"></MdOutlineAccountBalance>
          <span className="ml-4">Account Management</span>
        </div>
      </Link>

      <Link href="/users">
        <div className="flex p-8 focus:outline-none focus:bg-gray-700 hover:bg-slate-400 mb-10">
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
