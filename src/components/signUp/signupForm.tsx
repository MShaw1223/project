import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BiSolidHide, BiSolidShow } from "react-icons/bi";
import { BsChevronBarLeft } from "react-icons/bs";
import Link from "next/link";
import { HandlerProps } from "@/utils/helpful";
import { useState } from "react";

interface SignupProps extends HandlerProps {}

export const SignupForm = ({ handler }: SignupProps) => {
  // determines if the password is hidden or not when entering it during login
  const [showPassword, setShowPassword] = useState(false);
  return (
    <>
      <div className="flex h-screen bg-black">
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="m-12 flex text-3xl">
            <span className="my-auto font-black text-white">
              Sign Up To FXTrax
            </span>
          </div>
          <div className="flex-1 overflow-auto p-4 text-3xl">
            <div className="mx-auto my-auto h-[360px] min-w-[230px] max-w-[460px] rounded-3xl border bg-slate-300">
              <div className="flex p-3">
                <form onSubmit={handler} className="flex w-full flex-col">
                  <div className="flex flex-row justify-between p-2">
                    <h1 className="p-1 text-lg font-bold">Sign Up</h1>
                    <Link href="/">
                      <div className="flex justify-between rounded-md p-1 hover:bg-slate-200">
                        <BsChevronBarLeft />
                        <p className="text-center text-lg font-bold">Back</p>
                      </div>
                    </Link>
                  </div>
                  <div className="flex flex-row p-4">
                    <Input id="user" name="user" placeholder="Username....." />
                  </div>
                  <div className="flex flex-row p-4">
                    <Input
                      id="firstPassword"
                      type={showPassword ? "text" : "password"}
                      name="firstPassword"
                      placeholder="Password....."
                    />
                  </div>
                  <div className="flex flex-row p-4">
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
