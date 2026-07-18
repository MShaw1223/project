import { NextPage } from "next";
import { useRouter } from "next/router";
import { lginSignUpSchema } from "@/utils/schema";
import * as React from "react";
import { SignupForm } from "@/components/signUp/signupForm";
import { encoder } from "@/utils/encodeUser";

const signUp: NextPage = () => {
  const router = useRouter();
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
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
        // if the response returns a 200, the encoder function takes the username entered above as a param to generate a key the key will be used as a logged in identifier
        const { username } = parsedData;
        const key = encoder(username);
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
      <title>FXTrax - Sign Up</title>
      <SignupForm handler={handleSubmit} />
    </>
  );
};
export default signUp;
