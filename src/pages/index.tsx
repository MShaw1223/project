import { FormEvent } from "react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { keyGenerator } from "@/utils/hash";
import { lginSignUpSchema } from "@/utils/schema";
import { LoginForm } from "@/components/login/loginForm";

const login: NextPage = () => {
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
      <LoginForm handler={handleSubmit} />
    </>
  );
};

export default login;
