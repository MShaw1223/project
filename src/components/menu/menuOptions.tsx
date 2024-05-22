import { menuOptions } from "@/utils/menuOptions";
import Link from "next/link";
import {
  FaCalculator,
  FaHome,
  FaUserFriends,
  FaPencilAlt,
} from "react-icons/fa";
import { MdOutlineAccountBalance } from "react-icons/md";
import { MdArrowBack } from "react-icons/md";

interface OptProps {
  li: string;
  isActive: (x: string) => boolean;
}

export const OpenOptions = ({ li, isActive }: OptProps) => {
  return (
    <>
      <div className="h-screen flex flex-col justify-center space-y-4">
        {menuOptions.map((opt) => (
          <Link href={`${opt.value}?li=${li}`} key={opt.name}>
            <div
              className={`flex pl-5 py-4 mx-3 focus:outline-none font-bold hover:bg-gray-500 ${
                isActive(opt.value) ? "bg-gray-700 hover:bg-gray-700" : ""
              } rounded-2xl `}
            >
              {opt.name === "Home" ? (
                <FaHome className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 text-slate-100" />
              ) : opt.name === "Trade Entry" ? (
                <FaPencilAlt className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 text-slate-100" />
              ) : opt.name === "Entry Management" ? (
                <FaCalculator className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 text-slate-100" />
              ) : opt.name === "Account Management" ? (
                <MdOutlineAccountBalance className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 text-slate-100" />
              ) : opt.name === "Users" ? (
                <FaUserFriends className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 text-slate-100" />
              ) : opt.value === "/" ? (
                <MdArrowBack className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 text-slate-100" />
              ) : (
                <></>
              )}
              <span className="my-2 pl-3 text-slate-100 text-sm sm:text-base md:text-lg lg:text-xl">
                {opt.name}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
};
export const CollapsedOptions = ({ li, isActive }: OptProps) => {
  return (
    <>
      <div className="h-screen flex flex-col items-center justify-center space-y-4">
        {menuOptions.map((opt) => (
          <Link href={`${opt.value}?li=${li}`} key={opt.name}>
            <div
              className={`flex px-2 py-2 md:p-4 mx-3 focus:outline-none font-bold hover:bg-gray-500 ${
                isActive(opt.value) ? "bg-gray-700 hover:bg-gray-700" : ""
              } rounded-2xl `}
            >
              {opt.name === "Home" ? (
                <FaHome className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 text-slate-100" />
              ) : opt.name === "Trade Entry" ? (
                <FaPencilAlt className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 text-slate-100" />
              ) : opt.name === "Entry Management" ? (
                <FaCalculator className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 text-slate-100" />
              ) : opt.name === "Account Management" ? (
                <MdOutlineAccountBalance className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 text-slate-100" />
              ) : opt.name === "Users" ? (
                <FaUserFriends className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 text-slate-100" />
              ) : opt.value === "/" ? (
                <MdArrowBack className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 text-slate-100" />
              ) : (
                <></>
              )}
            </div>
          </Link>
        ))}
      </div>
    </>
  );
};
