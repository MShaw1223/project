import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, FormEvent } from "react";
import { NextPage } from "next";
import { BiSolidHide, BiSolidShow } from "react-icons/bi";
import { useRouter } from "next/router";
import { keyGenerator } from "@/utils/hash";
import { lginSignUpSchema } from "@/utils/schema";

const login: NextPage = () => {
  // determines if the password is hidden or not when entering it during login
  const [showPassword, setShowPassword] = useState(false);
  // used for pushing between different pages, in this case to the home page
  const router = useRouter();
  // when user presses the login button it triggers the handleSubmit function
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // prevents the page from refreshing during the process
    event.preventDefault();
    // gets all the information from the login form
    const data = new FormData(event.target as HTMLFormElement);
    const parsedData = lginSignUpSchema.parse({
      username: data.get("user") as string,
      passwd: data.get("password") as string,
    });
    // sends post request to check the credentials are correct,
    // with the username and password satisfying the schema
    const response = await fetch("/api/auth/loginApi", {
      method: "POST",
      body: JSON.stringify({
        username: parsedData.username,
        passwd: parsedData.passwd,
      }),
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    // data not being cached on the server due to passwords being handled
    if (response.ok) {
      // if the response returns a 200,
      // the keyGenerator function takes the username entered above as a param
      // to generate a key  the key will be used as a logged in identifier
      const { username } = parsedData;
      const key = keyGenerator(username);
      router.push(`/home?li=${key}`);
    } else if (!response.ok) {
      alert("Failed to login. Please try again.");
    }
  }
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
                  onSubmit={handleSubmit}
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

export default login;
