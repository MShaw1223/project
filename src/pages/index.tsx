import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormEvent, useState } from "react";
import { NextPage } from "next";
import { BiSolidHide, BiSolidShow } from "react-icons/bi";
import zod from "zod";

const schema = zod.object({
  passwd: zod.string().max(60),
  username: zod.string().max(15),
});

const login: NextPage = () => {
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData(event.target as HTMLFormElement);
    const unparseduser = data.get("user") as string;
    const unparsedpassword = data.get("password") as string;
    const parsedData = schema.parse({
      username: unparseduser,
      passwd: unparsedpassword,
    });
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
    if (!response.ok) {
      alert("Failed to login, try again");
    }
  }

  return (
    <>
      <div className="flex bg-black h-screen">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex ml-20 mt-20 mb-24 text-3xl">
            <span className="my-auto ml-20 font-black text-white">
              Welcome to FXTrax...
            </span>
          </div>
          <div className="flex-1 overflow-auto p-4 text-3xl">
            <div className="my-auto mx-auto w-[420px] border rounded-3xl bg-slate-300">
              <div className="p-3 flex w-full">
                <form onSubmit={handleSubmit} className="flex flex-col w-full">
                  <h1 className="font-bold text-lg p-2">Login</h1>
                  <div className="p-4 flex flex-row">
                    <Input id="user" name="user" placeholder="Username....." />
                  </div>
                  <div className="p-4 flex flex-row w-full">
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
