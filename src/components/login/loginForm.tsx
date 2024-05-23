import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BiSolidHide, BiSolidShow } from "react-icons/bi";
import { LoginSignupProps } from "@/utils/helpful";

export const LoginForm = ({ handler }: LoginSignupProps) => {
  // determines if the password is hidden or not when entering it during login
  const [showPassword, setShowPassword] = useState(false);
  return (
    <>
      <div className="flex bg-black h-screen">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex m-12 text-3xl">
            <span className="my-auto font-black text-white">
              Welcome to FXTrax
            </span>
          </div>
          <div className="flex-1 overflow-auto p-4 text-3xl">
            <div className="my-auto mx-auto h-[360px] max-w-[460px] min-w-[250px] border rounded-3xl bg-slate-300">
              <div className="p-3 flex">
                <form
                  onSubmit={handler}
                  className="flex flex-col space-y-2 w-full"
                >
                  <h1 className="font-bold text-lg p-2">Login</h1>
                  <div className="p-4 flex flex-row">
                    <Input id="user" name="user" placeholder="Username....." />
                  </div>
                  <div className="p-4 flex flex-row">
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
