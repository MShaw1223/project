import { BsChevronBarLeft, BsChevronBarRight } from "react-icons/bs";
import { OpenOptions } from "./menuOptions";
import { CollapsedOptions } from "./menuOptions";
import { Separator } from "../ui/separator";

interface Props {
  li: string;
  isActive: (x: string) => boolean;
  setOpen: (isOpen: boolean) => boolean;
  isOpen: boolean;
}

export const OpenView = ({ li, isActive, setOpen, isOpen }: Props) => {
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

export const CollapsedView = ({ li, isActive, setOpen, isOpen }: Props) => {
  return (
    <>
      <div className="max-w-screen fixed bottom-0 flex flex-row bg-black p-2 opacity-90 sm:h-screen sm:w-16 sm:flex-col md:w-24 lg:w-32">
        <div
          onClick={() => setOpen(!isOpen)}
          className="rounded-lg p-2 hover:bg-gray-500 focus:outline-none"
        >
          {isOpen ? (
            <BsChevronBarLeft className="text-white" />
          ) : (
            <BsChevronBarRight className="m-1 mx-auto -rotate-90 text-xl text-white sm:rotate-0 sm:text-xl md:text-xl lg:text-xl" />
          )}
        </div>
        <Separator orientation="vertical" className="mx-3" />
        <CollapsedOptions li={li} isActive={isActive} />
      </div>
    </>
  );
};
