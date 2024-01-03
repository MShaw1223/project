import { NextPage } from "next";
import Menu from "@/utils/menu";
import { FaHome } from "react-icons/fa";

const Home: NextPage = () => {
  //make a menu.ts file on utils? as the dropdown will be on all pages
  return (
    <div className="flex h-screen">
      <Menu />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex p-3 text-3xl">
          <FaHome className="h-10 w-10"></FaHome>
          <span className="ml-4 my-auto font-sans font-bold">Home</span>
        </div>
        <div className="flex-1 overflow-auto p-4 text-justify justify-center">
          Table showing stats will be displayed here
        </div>
      </div>
    </div>
  );
};
export default Home;
