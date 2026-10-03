import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { ResendConfirmationButton } from "@/components/auth/ResendConfirmationButton";
import { Field, SubmitButton } from "@/components/form/FormField";
import { FormError, FormSuccess } from "@/components/form/FormFeedback";
import { SESSION_QUERY_KEY } from "@/hooks/useSession";
import { ApiError } from "@/lib/api";
import { login } from "@/lib/auth";
import { ROUTES } from "@/lib/routes";
import { credentialsSchema, parseForm } from "@/lib/validation";

type Credentials = { email: string; password: string };

function loginErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return "Unable to reach the server. Please try again.";
  switch (error.status) {
    case 401:
      return "Incorrect email or password.";
    case 403:
      return "Confirm your email before logging in. Check your inbox for the link we sent you.";
    case 429: {
      const minutes = error.retryAfter ? Math.ceil(error.retryAfter / 60) : 15;
      return `Too many login attempts. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`;
    }
    default:
      return "Failed to login. Please try again.";
  }
}

// the result of the Supabase confirmation link, which lands on the login page with it in the url hash
function useConfirmationResult() {
  const [result, setResult] = useState<"confirmed" | "invalid" | null>(null);
  // the hash only exists in the browser, so it's read once on mount
  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    if (hash.get("type") !== "signup" && !hash.has("error")) return;
    // the hash can carry tokens, drop it from the address bar and history
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-off read of browser-only state
    setResult(hash.has("error") ? "invalid" : "confirmed");
  }, []);
  return result;
}

export function LoginForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const confirmation = useConfirmationResult();
  const [formError, setFormError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: ({ email, password }: Credentials) => login(email, password),
    onSuccess: (user) => {
      // start from an empty cache so nothing from an earlier session in this tab shows
      queryClient.clear();
      queryClient.setQueryData(SESSION_QUERY_KEY, user);
      navigate(ROUTES.dashboard);
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = parseForm(credentialsSchema, event.currentTarget);
    setFormError(parsed.error ?? null);
    if (parsed.data) mutation.mutate(parsed.data);
  }

  const unconfirmedEmail =
    mutation.error instanceof ApiError && mutation.error.status === 403 ? mutation.variables?.email : undefined;
  // the newest problem wins: a submit clears the confirmation-link result
  const error =
    formError ??
    (mutation.isError ? loginErrorMessage(mutation.error) : null) ??
    (confirmation === "invalid" && mutation.isIdle
      ? "That confirmation link is invalid or has expired. Sign up again to get a new one."
      : null);

  return (
    <AuthLayout
      title="Welcome back"
      description="Log in to your FXTrax journal."
      footer={
        <>
          No account?{" "}
          <Link to={ROUTES.signup} className="font-medium text-foreground underline-offset-4 hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {confirmation === "confirmed" && mutation.isIdle && (
          <FormSuccess message="Your email is confirmed. Log in to get started." />
        )}
        <Field label="Email" htmlFor="email">
          <Input id="email" name="email" type="email" placeholder="you@example.com" autoComplete="email" />
        </Field>
        <Field label="Password" htmlFor="password">
          <PasswordInput id="password" name="password" autoComplete="current-password" />
        </Field>
        {error && <FormError message={error} />}
        {unconfirmedEmail && <ResendConfirmationButton email={unconfirmedEmail} />}
        <SubmitButton pending={mutation.isPending} className="w-full">
          Log in
        </SubmitButton>
      </form>
    </AuthLayout>
  );
}
