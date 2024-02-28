import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import zod from "zod";
import * as React from "react";
import { NextPage } from "next";
import { BiSolidHide, BiSolidShow } from "react-icons/bi";
import comparePasswords from "@/utils/protection/comparePwd";
import { useRouter } from "next/router";
import { generateKey } from "@/utils/protection/hash";
import { lginSignUpSchema } from "@/utils/protection/schema";

const signUp: NextPage = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData(event.target as HTMLFormElement);
    const user = data.get("user") as string;
    const entry_pwd = data.get("firstPassword") as string;
    const confirmPasswd = data.get("confirmPassword") as string;
    const parsedData = lginSignUpSchema.parse({
      passwd: entry_pwd,
      username: user,
    });
    // reusing the utility for logging in to check the two passwords match
    console.log(parsedData);
    const isMatch = comparePasswords(entry_pwd, confirmPasswd);
    if (isMatch === true) {
      console.log("in the signup.tsx handler");
      const parsedData = schema.parse({
        passwd: entry_pwd,
        username: user,
      });
      console.log(parsedData);
      const response = await fetch("/api/auth/userPwd", {
        method: "POST",
        body: JSON.stringify(parsedData),
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });
      if (response.ok) {
        const { username } = parsedData;
        const key = generateKey(username);
        console.log(key);
        router.push(`/home?li=${key}`);
      }
      if (!response.ok) {
        alert("Failed to sign up, try again");
      }
    } else if (isMatch === false) {
      alert("Passwords do not match");
    }
  }
  return (
    <>
      <div className="flex h-screen bg-black">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex ml-20 mt-20 mb-24 text-3xl">
            <span className="my-auto ml-20 font-black text-white">
              Sign Up To FXTrax...
            </span>
          </div>
          <div className="flex-1 overflow-auto p-4 text-3xl">
            <div className="my-auto mx-auto w-[430px] border rounded-3xl bg-slate-300">
              <div className="p-3 flex w-full">
                <form onSubmit={handleSubmit} className="flex flex-col w-full">
                  <h1 className="font-bold text-lg p-2">Sign Up</h1>
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

export default signUp;
