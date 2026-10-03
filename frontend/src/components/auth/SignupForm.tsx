import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { CheckEmail } from "@/components/auth/CheckEmail";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { Field, SubmitButton } from "@/components/form/FormField";
import { FormError } from "@/components/form/FormFeedback";
import { ApiError } from "@/lib/api";
import { signup } from "@/lib/auth";
import { ROUTES } from "@/lib/routes";
import { parseForm, signupSchema } from "@/lib/validation";

type Credentials = { email: string; password: string };

export function SignupForm() {
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: ({ email, password }: Credentials) => signup(email, password),
    onSuccess: ({ emailConfirmationRequired }) => {
      // signing up does not start a session, the user logs in afterwards
      if (!emailConfirmationRequired) navigate(ROUTES.login);
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = parseForm(signupSchema, event.currentTarget);
    setFormError(parsed.error ?? null);
    if (parsed.data) mutation.mutate(parsed.data);
  }

  // the account exists but Supabase is waiting on the user to confirm this address
  if (mutation.data?.emailConfirmationRequired && mutation.variables) {
    return <CheckEmail email={mutation.variables.email} />;
  }

  const error =
    formError ??
    (mutation.isError
      ? mutation.error instanceof ApiError
        ? "Failed to sign up, check your details or try another email."
        : "Unable to reach the server. Please try again."
      : null);

  return (
    <AuthLayout
      title="Create an account"
      description="Start journaling your trades with FXTrax."
      footer={
        <>
          Already have an account?{" "}
          <Link to={ROUTES.login} className="font-medium text-foreground underline-offset-4 hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Email" htmlFor="email">
          <Input id="email" name="email" type="email" placeholder="you@example.com" autoComplete="email" />
        </Field>
        <Field label="Password" htmlFor="password">
          <PasswordInput id="password" name="password" autoComplete="new-password" />
        </Field>
        <Field label="Confirm password" htmlFor="confirmPassword">
          <PasswordInput id="confirmPassword" name="confirmPassword" autoComplete="new-password" />
        </Field>
        {error && <FormError message={error} />}
        <SubmitButton pending={mutation.isPending} className="w-full">
          Sign up
        </SubmitButton>
      </form>
    </AuthLayout>
  );
}
