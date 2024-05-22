import { BsChevronBarLeft, BsChevronBarRight } from "react-icons/bs";
import { OpenOptions } from "./menuOptions";
import { CollapsedOptions } from "./menuOptions";

interface Props {
  li: string;
  isActive: (x: string) => boolean;
  setOpen: (isOpen: boolean) => void;
  isOpen: boolean;
}

export const OpenView = ({ li, isActive, setOpen, isOpen }: Props) => {
  return (
    <>
      <div
        className={`fixed flex flex-col p-2 h-screen bg-black w-[235px] sm:w-[250px] md:w-1/8 lg:w-1/4
        `}
      >
        <div
          onClick={() => setOpen(!isOpen)}
          className=" focus:outline-none hover:bg-gray-500 rounded-lg p-2"
        >
          {isOpen ? (
            <BsChevronBarLeft className="text-white text-xl sm:text-xl md:text-xl lg:text-xl mx-auto m-1" />
          ) : (
            <BsChevronBarRight />
          )}
        </div>
        <OpenOptions li={li} isActive={isActive} />
      </div>
    </>
  );
};

export const CollapsedView = ({ li, isActive, setOpen, isOpen }: Props) => {
  return (
    <>
      <div
        className={`fixed flex flex-col p-2 h-screen bg-black w-12 sm:w-16 md:w-24 lg:w-32}`}
      >
        <div
          onClick={() => setOpen(!isOpen)}
          className="focus:outline-none hover:bg-gray-500 rounded-lg p-2"
        >
          {isOpen ? (
            <BsChevronBarLeft className="text-white" />
          ) : (
            <BsChevronBarRight className="text-white text-xl sm:text-xl md:text-xl lg:text-xl mx-auto m-1" />
          )}
        </div>
        <CollapsedOptions li={li} isActive={isActive} />
      </div>
    </>
  );
};
