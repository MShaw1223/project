import { BsChevronBarLeft, BsChevronBarRight } from "react-icons/bs";
import { OpenOptions } from "./menuOptions";
import { MenuProps } from "@/utils/helpful";
import { Menu } from "lucide-react";

interface ClosedViewProps extends MenuProps {
  setOpen: (isOpen: boolean) => void;
  isOpen: boolean;
}

interface OpenViewProps extends MenuProps, ClosedViewProps {}

export const OpenView = ({ li, isActive, setOpen, isOpen }: OpenViewProps) => {
  return (
    <>
      <div className="md:w-1/8 fixed flex h-screen w-[245px] flex-col bg-black p-2 opacity-90 sm:w-[250px] lg:w-1/4">
        <div
          onClick={() => setOpen(!isOpen)}
          className="rounded-lg p-2 hover:bg-gray-500 focus:outline-none"
        >
          {isOpen ? (
            <BsChevronBarLeft className="m-1 mx-auto text-xl text-white sm:text-xl md:text-xl lg:text-xl" />
          ) : (
            <BsChevronBarRight />
          )}
        </div>
        <OpenOptions li={li} isActive={isActive} setOpen={setOpen} />
      </div>
    </>
  );
};

export const CollapsedView = ({ isOpen, setOpen }: ClosedViewProps) => {
  return (
    <>
      <div
        className="fixed flex rounded-lg p-2 hover:bg-slate-300 focus:outline-none"
        onClick={() => setOpen(!isOpen)}
      >
        <Menu className="m-2 text-xl font-black" />
      </div>
    </>
  );
};
