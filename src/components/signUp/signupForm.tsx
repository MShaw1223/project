import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BiSolidHide, BiSolidShow } from "react-icons/bi";
import { BsChevronBarLeft } from "react-icons/bs";
import Link from "next/link";
import { LoginSignupProps } from "@/utils/helpful";
import { useState } from "react";

export const SignupForm = ({ handler }: LoginSignupProps) => {
  // determines if the password is hidden or not when entering it during login
  const [showPassword, setShowPassword] = useState(false);
  return (
    <>
      <div className="flex h-screen bg-black">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex m-12 text-3xl">
            <span className="my-auto font-black text-white">
              Sign Up To FXTrax
            </span>
          </div>
          <div className="flex-1 overflow-auto p-4 text-3xl">
            <div className="my-auto mx-auto h-[360px] max-w-[460px] min-w-[230px] border rounded-3xl bg-slate-300">
              <div className="p-3 flex">
                <form onSubmit={handler} className="flex flex-col w-full">
                  <div className="p-2 flex flex-row justify-between">
                    <h1 className="font-bold text-lg p-1">Sign Up</h1>
                    <Link href="/">
                      <div className="flex justify-between hover:bg-slate-200 rounded-md p-1">
                        <BsChevronBarLeft />
                        <p className="text-center font-bold text-lg">Back</p>
                      </div>
                    </Link>
                  </div>
                  <div className="p-4 flex flex-row">
                    <Input id="user" name="user" placeholder="Username....." />
                  </div>
                  <div className="p-4 flex flex-row">
                    <Input
                      id="firstPassword"
                      type={showPassword ? "text" : "password"}
                      name="firstPassword"
                      placeholder="Password....."
                    />
                  </div>
                  <div className="p-4 flex flex-row">
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm Password....."
                    />
                    <Button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="ml-2 focus:outline-none"
                    >
                      {showPassword ? <BiSolidHide /> : <BiSolidShow />}
                    </Button>
                  </div>
                  <div className="p-4">
                    <Button type="submit" className="w-full">
                      Go !
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
