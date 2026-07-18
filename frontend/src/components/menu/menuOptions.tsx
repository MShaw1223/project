import { MenuProps } from "@/utils/helpful";
import { menuOptions } from "@/utils/menuOptions";
import { useRouter } from "next/navigation";
import {
  FaCalculator,
  FaHome,
  FaUserFriends,
  FaPencilAlt,
} from "react-icons/fa";
import { MdOutlineAccountBalance } from "react-icons/md";
import { MdArrowBack } from "react-icons/md";

interface OpenOpts extends MenuProps {
  setOpen: (isOpen: boolean) => void;
}

interface ClosedOpts extends MenuProps {}

export const OpenOptions = ({ li, isActive, setOpen }: OpenOpts) => {
  const router = useRouter();
  return (
    <>
      <div className="flex h-screen flex-col justify-center space-y-1">
        {menuOptions.map((opt) => (
          <a
            href={opt.value != "/" ? `${opt.value}?li=${li}` : `${opt.value}`}
            key={opt.name}
            onClick={(e) => {
              e.preventDefault();
              setOpen(false);
              router.push(
                opt.value != "/" ? `${opt.value}?li=${li}` : `${opt.value}`,
              );
            }}
          >
            <div
              className={`flex py-4 pl-5 font-bold hover:bg-gray-500 focus:outline-none ${
                isActive(opt.value) ? "bg-gray-700 hover:bg-gray-700" : ""
              } rounded-2xl`}
            >
              {opt.name === "Home" ? (
                <FaHome className="my-[6px] h-6 w-6 text-slate-100 md:h-8 md:w-8 lg:h-10 lg:w-10" />
              ) : opt.name === "Trade Entry" ? (
                <FaPencilAlt className="my-[6px] h-6 w-6 text-slate-100 md:h-8 md:w-8 lg:h-10 lg:w-10" />
              ) : opt.name === "Manage Entries" ? (
                <FaCalculator className="my-[6px] h-6 w-6 text-slate-100 md:h-8 md:w-8 lg:h-10 lg:w-10" />
              ) : opt.name === "Manage Account" ? (
                <MdOutlineAccountBalance className="my-[6px] h-6 w-6 text-slate-100 md:h-8 md:w-8 lg:h-10 lg:w-10" />
              ) : opt.name === "Users" ? (
                <FaUserFriends className="my-[6px] h-6 w-6 text-slate-100 md:h-8 md:w-8 lg:h-10 lg:w-10" />
              ) : opt.value === "/" ? (
                <MdArrowBack className="my-[6px] h-6 w-6 text-slate-100 md:h-8 md:w-8 lg:h-10 lg:w-10" />
              ) : (
                <></>
              )}
              <span className="pl-2 text-sm text-slate-100 sm:my-2 sm:pl-3 sm:text-base md:text-lg lg:text-xl">
                {opt.name}
              </span>
            </div>
          </a>
        ))}
      </div>
    </>
  );
};
export const CollapsedOptions = ({ li, isActive }: ClosedOpts) => {
  const router = useRouter();
  return (
    <>
      <div className="flex w-screen flex-row items-end space-y-1 sm:h-screen sm:w-12 sm:flex-col sm:items-start sm:justify-center">
        {/* "h-screen flex flex-col items-center justify-center space-y-1" */}
        {menuOptions.map((opt) => (
          <a
            href={opt.value != "/" ? `${opt.value}?li=${li}` : `${opt.value}`}
            key={opt.name}
            onClick={(e) => {
              e.preventDefault();
              router.push(
                opt.value != "/" ? `${opt.value}?li=${li}` : `${opt.value}`,
              );
            }}
          >
            <div
              className={`mx-[6px] flex px-2 py-2 font-bold hover:bg-gray-500 focus:outline-none sm:mx-3 md:p-4 ${
                isActive(opt.value) ? "bg-gray-700 hover:bg-gray-700" : ""
              } rounded-2xl`}
            >
              {opt.name === "Home" ? (
                <FaHome className="h-6 w-6 text-slate-100 md:h-8 md:w-8 lg:h-10 lg:w-10" />
              ) : opt.name === "Trade Entry" ? (
                <FaPencilAlt className="h-6 w-6 text-slate-100 md:h-8 md:w-8 lg:h-10 lg:w-10" />
              ) : opt.name === "Manage Entries" ? (
                <FaCalculator className="h-6 w-6 text-slate-100 md:h-8 md:w-8 lg:h-10 lg:w-10" />
              ) : opt.name === "Manage Account" ? (
                <MdOutlineAccountBalance className="h-6 w-6 text-slate-100 md:h-8 md:w-8 lg:h-10 lg:w-10" />
              ) : opt.name === "Users" ? (
                <FaUserFriends className="h-6 w-6 text-slate-100 md:h-8 md:w-8 lg:h-10 lg:w-10" />
              ) : opt.value === "/" ? (
                <MdArrowBack className="h-6 w-6 text-slate-100 md:h-8 md:w-8 lg:h-10 lg:w-10" />
              ) : (
                <></>
              )}
            </div>
          </a>
        ))}
      </div>
    </>
  );
};
