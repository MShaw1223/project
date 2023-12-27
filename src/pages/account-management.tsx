import { NextPage } from "next";
import Link from "next/link";
import { FaHome } from "react-icons/fa";

const accountManagement: NextPage = () => {
  return (
    <div className="flex flex-col flex-wrap items-center mt-5">
      <Link href="/home" className="p-3">
        <FaHome className="h-5 w-5"></FaHome>
      </Link>
      <div className="text-center font-extrabold text-xl">
        <h1>Account Management</h1>
        <p>
          This is where there Accounts can be deleted, created, and deposited
          into
        </p>
      </div>
    </div>
  );
};

export default accountManagement;
