import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as React from "react";
import { NextPage } from "next";
import { BiSolidHide, BiSolidShow } from "react-icons/bi";
import { useRouter } from "next/router";
import { keyGenerator } from "@/utils/hash";
import { lginSignUpSchema } from "@/utils/schema";
import { BsChevronBarLeft } from "react-icons/bs";
import Link from "next/link";

const signUp: NextPage = () => {
  // determines if the password is hidden or not when entering it during login
  const [showPassword, setShowPassword] = React.useState(false);
  // used for pushing between different pages, in this case to the home page
  const router = useRouter();
  // when user presses the 'Go !' button it triggers the handleSubmit function
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    // prevents the page from refreshing during the process
    event.preventDefault();
    // gets all the information from the form
    const data = new FormData(event.target as HTMLFormElement);
    const confirmPasswd = data.get("confirmPassword") as string;
    const parsedData = lginSignUpSchema.parse({
      passwd: data.get("firstPassword") as string,
      username: data.get("user") as string,
    });

    // the if statement checks the password has been entered correctly before submitting the parsedData object
    // to the api to be submitted to the Neon database
    // ( parseData containing the future login credentials of username and passwd )
    if (parsedData.passwd === confirmPasswd) {
      const response = await fetch("/api/auth/userPwd", {
        method: "POST",
        body: JSON.stringify(parsedData),
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });
      if (response.ok) {
        // if the response returns a 200,
        // the keyGenerator function takes the username entered above as a param
        // to generate a key  the key will be used as a logged in identifier
        const { username } = parsedData;
        const key = keyGenerator(username);
        router.push(`/home?li=${key}`);
      }
      if (!response.ok) {
        alert("Failed to sign up, try another username");
        return;
      }
    } else {
      alert("Passwords do not match");
      return;
    }
  }
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
                <form onSubmit={handleSubmit} className="flex flex-col w-full">
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

export default signUp;
