import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/router";
import { useMutation } from "react-query";
import { FormEvent, useEffect, useRef, useState } from "react";
import { NextPage } from "next";
import { BiSolidHide, BiSolidShow } from "react-icons/bi";

const signUp: NextPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const router = useRouter();

  const cancelFetch = useRef(false);

  useEffect(() => {
    return () => {
      cancelFetch.current = true;
    };
  }, []);

  const mutation = useMutation({
    mutationFn: async (formData: string) => {
      const response = await fetch("api/userPwd", {
        method: "POST",
        body: formData,
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error("Failed to submit data");
      }
      const data = await response.json();
      return data;
    },
    onError: (error) => {
      console.error("Mutation error:", error);
    },
    onSuccess: (data) => {
      if (data.error) {
        setErrorMessage("Invalid username or password");
      } else {
        router.push("/home");
      }
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData(event.target as HTMLFormElement);
    const username = data.get("username");
    const unhashed_passwd = data.get("passwd");
    const confirmPasswd = data.get("confirmPassword");

    if (!username || !unhashed_passwd) {
      alert("Invalid username and password");
      return;
    }
    if (unhashed_passwd !== confirmPasswd) {
      alert("Passwords do not match");
      return;
    }

    const dataPackage = JSON.stringify({
      username,
      unhashed_passwd,
    });

    mutation.mutate(dataPackage);
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
              {mutation.isLoading && <p className="p-5">Loading...</p>}
              {!mutation.isLoading && (
                <div className="p-3 flex w-full">
                  <form
                    onSubmit={handleSubmit}
                    className="flex flex-col w-full"
                  >
                    <h1 className="font-bold text-lg p-2">Sign Up</h1>
                    {errorMessage && (
                      <p className="text-red-500">{errorMessage}</p>
                    )}
                    <div className="p-4 flex flex-row">
                      <Input
                        id="username"
                        name="username"
                        placeholder="Username....."
                      />
                    </div>
                    <div className="p-4 flex flex-row">
                      <Input
                        id="passwd"
                        type={showPassword ? "text" : "password"}
                        name="passwd"
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
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default signUp;
