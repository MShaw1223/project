import Link from "next/link";
import {
  FaCalculator,
  FaHome,
  FaUserFriends,
  FaPencilAlt,
} from "react-icons/fa";
import { MdOutlineAccountBalance } from "react-icons/md";
import { BsChevronBarLeft, BsChevronBarRight } from "react-icons/bs";
import { MdArrowBack } from "react-icons/md";
import { useRouter } from "next/router";
import { Separator } from "@/components/ui/separator";

interface MenuProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Menu: React.FC<MenuProps> = ({ isOpen, setIsOpen }) => {
  const router = useRouter();
  const isLinkActive = (href: string) => router.pathname === href;
  const { li } = router.query;

  return (
    <>
      <div className="relative z-10">
        {isOpen ? (
          <div
            className={`fixed h-screen bg-black transition-width duration-500 ease-in-out ${
              isOpen ? "sm:w-[290px] lg:w-1/8" : "w-20"
            }`}
          >
            <div className="flex justify-between items-center p-5 text-2xl font-sans font-semibold text-slate-100">
              <span>Menu</span>
              <div
                onClick={() => setIsOpen(!isOpen)}
                className=" focus:outline-none hover:bg-gray-500 rounded-lg p-1"
              >
                {isOpen ? <BsChevronBarLeft /> : <BsChevronBarRight />}
              </div>
            </div>

            <Separator className="ml-9 my-7 bg-inherit" />

            <Link href={`/home?li=${li}`}>
              <div
                className={`flex pl-5 py-4 mx-3 focus:outline-none font-bold hover:bg-gray-500 ${
                  isLinkActive("/home") ? "bg-gray-700 hover:bg-gray-700" : ""
                } rounded-full `}
              >
                <FaHome className="w-6 h-6 text-slate-100"></FaHome>
                <span className="pl-3 text-slate-100">Home</span>
              </div>
            </Link>

            <Link href={`/Trade-Entry?li=${li}`}>
              <div
                className={`flex pl-5 py-4 mx-3 focus:outline-none font-bold hover:bg-gray-500 ${
                  isLinkActive("/Trade-Entry")
                    ? "bg-gray-700 hover:bg-gray-700"
                    : ""
                } rounded-full `}
              >
                <FaPencilAlt className="w-6 h-6 text-slate-100"></FaPencilAlt>
                <span className="pl-3 text-slate-100">Trade Entry</span>
              </div>
            </Link>

            <Link href={`/entry-management?li=${li}`}>
              <div
                className={`flex pl-5 py-4 mx-3 focus:outline-none font-bold hover:bg-gray-500 ${
                  isLinkActive("/entry-management")
                    ? "bg-gray-700 hover:bg-gray-700"
                    : ""
                } rounded-full `}
              >
                <FaCalculator className="w-6 h-6 text-slate-100"></FaCalculator>
                <span className="pl-3 text-slate-100">Entry Management</span>
              </div>
            </Link>

            <Link href={`/account-management?li=${li}`}>
              <div
                className={`flex pl-5 py-4 mx-3 focus:outline-none font-bold hover:bg-gray-500 ${
                  isLinkActive("/account-management")
                    ? "bg-gray-700 hover:bg-gray-700"
                    : ""
                } rounded-full`}
              >
                <MdOutlineAccountBalance className="w-6 h-6 text-slate-100"></MdOutlineAccountBalance>
                <span className="pl-3 text-slate-100">Account Management</span>
              </div>
            </Link>

            <Link href={`/users?li=${li}`}>
              <div
                className={`flex pl-5 py-4 mx-3 focus:outline-none font-bold hover:bg-gray-500 ${
                  isLinkActive("/users") ? "bg-gray-700 hover:bg-gray-700" : ""
                } rounded-full `}
              >
                <FaUserFriends className="w-6 h-6 text-slate-100"></FaUserFriends>
                <span className="pl-3 text-slate-100">Users</span>
              </div>
            </Link>

            <Separator className="ml-9 my-7 bg-inherit" />

            <Link href="/">
              <div className="flex pl-5 py-4 mx-3 focus:outline-none font-bold hover:bg-gray-500 rounded-full">
                <MdArrowBack className="w-6 h-6 text-slate-100"></MdArrowBack>
                <span className="pl-3 text-slate-100">Back to Login</span>
              </div>
            </Link>
          </div>
        ) : (
          // collapsed
          <div className="top-0 left-0 h-screen flex flex-col items-center justify-center bg-black p-5">
            <div
              onClick={() => setIsOpen(!isOpen)}
              className="focus:outline-none hover:bg-gray-500 rounded-lg p-2"
            >
              {isOpen ? (
                <BsChevronBarLeft className="text-white text-2xl" />
              ) : (
                <BsChevronBarRight className="text-white text-2xl" />
              )}
            </div>
            <div className="h-screen flex flex-col items-center justify-center space-y-4">
              <Link href={`/home?li=${li}`}>
                <div
                  className={`flex p-2 focus:outline-none font-bold hover:bg-gray-500 ${
                    isLinkActive("/home") ? "bg-gray-700 hover:bg-gray-700" : ""
                  } rounded-lg `}
                >
                  <FaHome className="w-6 h-6 text-slate-100"></FaHome>
                </div>
              </Link>

              <Link href={`/Trade-Entry?li=${li}`}>
                <div
                  className={`flex p-2 focus:outline-none font-bold hover:bg-gray-500 ${
                    isLinkActive("/Trade-Entry")
                      ? "bg-gray-700 hover:bg-gray-700"
                      : ""
                  } rounded-lg `}
                >
                  <FaPencilAlt className="w-6 h-6 text-slate-100"></FaPencilAlt>
                </div>
              </Link>

              <Link href={`/entry-management?li=${li}`}>
                <div
                  className={`flex p-2 focus:outline-none font-bold hover:bg-gray-500 ${
                    isLinkActive("/entry-management")
                      ? "bg-gray-700 hover:bg-gray-700"
                      : ""
                  } rounded-lg `}
                >
                  <FaCalculator className="w-6 h-6 text-slate-100"></FaCalculator>
                </div>
              </Link>

              <Link href={`/account-management?li=${li}`}>
                <div
                  className={`flex p-2 focus:outline-none font-bold hover:bg-gray-500 ${
                    isLinkActive("/account-management")
                      ? "bg-gray-700 hover:bg-gray-700"
                      : ""
                  } rounded-lg`}
                >
                  <MdOutlineAccountBalance className="w-6 h-6 text-slate-100"></MdOutlineAccountBalance>
                </div>
              </Link>

              <Link href={`/users?li=${li}`}>
                <div
                  className={`flex p-2 focus:outline-none font-bold hover:bg-gray-500 ${
                    isLinkActive("/users")
                      ? "bg-gray-700 hover:bg-gray-700"
                      : ""
                  } rounded-lg `}
                >
                  <FaUserFriends className="w-6 h-6 text-slate-100"></FaUserFriends>
                </div>
              </Link>

              <Link href="/">
                <div className="flex p-2 focus:outline-none font-bold hover:bg-gray-500 rounded-lg">
                  <MdArrowBack className="w-6 h-6 text-slate-100"></MdArrowBack>
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Menu;
