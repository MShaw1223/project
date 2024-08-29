import { NextPage } from "next";
import { useRouter } from "next/router";
import { keyGenerator } from "@/utils/hash";
import { lginSignUpSchema } from "@/utils/schema";
import * as React from "react";
import { SignupForm } from "@/components/signUp/signupForm";

const signUp: NextPage = () => {
  // used for pushing between different pages, in this case to the home page
  const router = useRouter();
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    // prevents the page from refreshing during the process
    event.preventDefault();
    const data = new FormData(event.target as HTMLFormElement);
    const confirmPasswd = data.get("confirmPassword") as string;
    const parsedData = lginSignUpSchema.parse({
      passwd: data.get("firstPassword") as string,
      username: data.get("user") as string,
    });
    // the if statement checks the password has been entered correctly before submitting the parsedData object to the api to be submitted to the Neon database
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
        // if the response returns a 200, the keyGenerator function takes the username entered above as a param to generate a key  the key will be used as a logged in identifier
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
      <SignupForm handler={handleSubmit} />
    </>
  );
};
export default signUp;
