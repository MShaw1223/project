import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";
import { Input } from "@/components/ui/input";
import { useMutation } from "react-query";
import { FormEvent, useState } from "react";
import { NextPage } from "next";
import { BiSolidHide, BiSolidShow } from "react-icons/bi";
import withAuth from "@/utils/authorise";

const login: NextPage = () => {
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async (formData: string) => {
      const response = await fetch("/api/loginApi", {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }).then((t) => t.json());

      const token = response.token;
      if (token) {
        router.push("/home");
      }

      if (!response.ok) {
        throw new Error("Failed to submit data");
      }
      return response.json();
    },
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData(event.target as HTMLFormElement);
    const username = data.get("username") as string;
    const password = data.get("password") as string;

    if (!username || !password) {
      alert("Invalid username and password");
      return;
    }
    try {
      const dataPackage = JSON.stringify({
        passwd: password,
        username,
      });
      console.log("Not sent yet: ", dataPackage);
      mutation.mutate(dataPackage);
    } catch (error) {
      console.error("Error:", error);
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
              {mutation.isLoading && <p className="p-5">Loading...</p>}
              {!mutation.isLoading && (
                <div className="p-3 flex w-full">
                  <form
                    onSubmit={handleSubmit}
                    className="flex flex-col w-full"
                  >
                    <h1 className="font-bold text-lg p-2">Login</h1>
                    <div className="p-4 flex flex-row">
                      <Input
                        id="username"
                        name="username"
                        placeholder="Username....."
                      />
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
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default withAuth(login);
