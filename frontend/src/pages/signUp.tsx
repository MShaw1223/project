import { FormEvent, useState } from "react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { credentialsSchema } from "@/utils/schema";
import { SignupForm } from "@/components/signUp/signupForm";
import { CheckEmail } from "@/components/signUp/CheckEmail";
import { signup } from "@/lib/auth";

const SignUpPage: NextPage = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  // set once the account exists but Supabase is waiting on the user to confirm this address
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const parsed = credentialsSchema.safeParse({
      email: data.get("email"),
      password: data.get("firstPassword"),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    if (parsed.data.password !== data.get("confirmPassword")) {
      setError("Passwords do not match");
      return;
    }
    let confirmationRequired: boolean;
    try {
      const response = await signup(parsed.data.email, parsed.data.password);
      if (!response.ok) {
        setError("Failed to sign up, check your details or try another email.");
        return;
      }
      const body = await response.json().catch(() => ({}));
      confirmationRequired = body.email_confirmation_required === true;
    } catch {
      setError("Unable to reach the server. Please try again.");
      return;
    }
    if (confirmationRequired) {
      setPendingEmail(parsed.data.email);
      return;
    }
    // signing up does not start a session, the user logs in afterwards
    router.push("/");
  }
  if (pendingEmail !== null) {
    return (
      <>
        <title>FXTrax - Check your email</title>
        <CheckEmail email={pendingEmail} />
      </>
    );
  }
  return (
    <>
      <title>FXTrax - Sign Up</title>
      <SignupForm handler={handleSubmit} error={error} />
    </>
  );
};
export default SignUpPage;
