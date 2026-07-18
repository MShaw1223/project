import { FormEvent } from "react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { lginSignUpSchema } from "@/utils/schema";
import { LoginForm } from "@/components/login/loginForm";
import { encoder } from "@/utils/encodeUser";

const login: NextPage = () => {
  const router = useRouter();
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // gets all the information from the login form
    const data = new FormData(event.target as HTMLFormElement);
    const parsedData = lginSignUpSchema.parse({
      username: data.get("user") as string,
      passwd: data.get("password") as string,
    });
    // sends post request to check the credentials are correct with the username and password satisfying the schema
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
    if (response.ok) {
      // if the response returns a 200 the encoding function takes the username entered above as a param to generate a key the key will be used as a logged in identifier
      const { username } = parsedData;
      const key = encoder(username);
      router.push(`/home?li=${key}`);
    } else if (!response.ok) {
      alert("Failed to login. Please try again.");
    }
  }
  return (
    <>
      <title>FXTrax - Login</title>
      <LoginForm handler={handleSubmit} />
    </>
  );
};
export default login;
