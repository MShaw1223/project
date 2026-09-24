import { FormEvent, useEffect, useState } from "react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { credentialsSchema } from "@/utils/schema";
import { LoginForm } from "@/components/login/loginForm";
import { login } from "@/lib/auth";

const LoginPage: NextPage = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);

  // Supabase's confirmation link lands back here with the result in the url hash
  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    if (hash.get("type") !== "signup" && !hash.has("error")) return;
    if (hash.has("error")) {
      setError("That confirmation link is invalid or has expired. Sign up again to get a new one.");
    } else {
      setNotice("Your email is confirmed. Log in to get started.");
    }
    // the hash can carry tokens, drop it from the address bar and history
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
  }, []);
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUnconfirmedEmail(null);
    const data = new FormData(event.currentTarget);
    const parsed = credentialsSchema.safeParse({
      email: data.get("email"),
      password: data.get("password"),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    try {
      const response = await login(parsed.data.email, parsed.data.password);
      if (response.status === 403) {
        setError("Confirm your email before logging in. Check your inbox for the link we sent you.");
        setUnconfirmedEmail(parsed.data.email);
        return;
      }
      if (response.status === 429) {
        const seconds = Number(response.headers.get("Retry-After"));
        const minutes = Number.isFinite(seconds) && seconds > 0 ? Math.ceil(seconds / 60) : 15;
        setError(`Too many login attempts. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`);
        return;
      }
      if (response.status === 401) {
        setError("Incorrect email or password.");
        return;
      }
      if (!response.ok) {
        setError("Failed to login. Please try again.");
        return;
      }
    } catch {
      setError("Unable to reach the server. Please try again.");
      return;
    }
    // a 200 means the backend set the httpOnly session cookie, every page authenticates with it
    router.push("/home");
  }
  return (
    <>
      <title>FXTrax - Login</title>
      <LoginForm handler={handleSubmit} error={error} notice={notice} unconfirmedEmail={unconfirmedEmail} />
    </>
  );
};
export default LoginPage;
