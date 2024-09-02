import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BiSolidHide, BiSolidShow } from "react-icons/bi";
import { HandlerProps } from "@/utils/helpful";

interface LoginProps extends HandlerProps {}

export const LoginForm = ({ handler }: LoginProps) => {
  // determines if the password is hidden or not when entering it during login
  const [showPassword, setShowPassword] = useState(false);
  return (
    <>
      <div className="flex h-screen bg-black">
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="m-12 flex text-3xl">
            <span className="my-auto font-black text-white">
              Welcome to FXTrax
            </span>
          </div>
          <div className="flex-1 overflow-auto p-4 text-3xl">
            <div className="mx-auto my-auto h-[360px] min-w-[250px] max-w-[460px] rounded-3xl border bg-slate-300">
              <div className="flex p-3">
                <form
                  onSubmit={handler}
                  className="flex w-full flex-col space-y-2"
                >
                  <h1 className="p-2 text-lg font-bold">Login</h1>
                  <div className="flex flex-row p-4">
                    <Input id="user" name="user" placeholder="Username....." />
                  </div>
                  <div className="flex flex-row p-4">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Password....."
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
                  <div>
                    <p className="text-center text-sm hover:underline">
                      <a href="/signUp">No account? Sign Up here</a>
                    </p>
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
