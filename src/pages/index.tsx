import { NextPage } from "next";
import Login from "@/utils/index/LoginPage";

const LogIn: NextPage = () => {
  return (
    <>
      <div className="flex h-screen bg-black">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex ml-20 mt-20 mb-24 text-3xl">
            <span className="my-auto ml-20 font-black text-white">
              Welcome To FXTrax...
            </span>
          </div>
          <div className="flex-1 overflow-auto p-4 text-3xl">
            <Login />
          </div>
        </div>
      </div>
    </>
  );
};

export default LogIn;
