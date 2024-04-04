import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as React from "react";
import { NextPage } from "next";
import { BiSolidHide, BiSolidShow } from "react-icons/bi";
import { useRouter } from "next/router";
import { generateKey } from "@/utils/protection/hash";
import { lginSignUpSchema } from "@/utils/protection/schema";

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
    console.log(parsedData);
    // the if statement checks the password has been entered correctly before submitting the parsedData object
    // to the api to be submitted to the Neon database
    // ( parseData containing the future login credentials of username and passwd )
    if (parsedData.passwd === confirmPasswd) {
      console.log("in the signup.tsx handler");
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
        // if the response returns a 200,
        // the generateKey function takes the username entered above as a param
        // to generate a key  the key will be used as a logged in identifier
        const { username } = parsedData;
        const key = generateKey(username);
        console.log(key);
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
