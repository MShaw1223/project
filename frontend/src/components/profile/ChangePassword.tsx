import { FormEvent, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, SubmitButton } from "@/components/form/FormField";
import { FormError, FormSuccess } from "@/components/form/FormFeedback";
import { Input } from "@/components/ui/input";
import { updatePassword } from "@/lib/profile";
import { LIMITS, changePasswordSchema, parseForm } from "@/lib/validation";

export const ChangePassword = () => {
  const [formError, setFormError] = useState<string | null>(null);
  const mutation = useMutation({ mutationFn: updatePassword });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const parsed = parseForm(changePasswordSchema, form);
    setFormError(parsed.error ?? null);
    if (parsed.data) mutation.mutate(parsed.data.password, { onSuccess: () => form.reset() });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change password</CardTitle>
        <CardDescription>
          Use {LIMITS.passwordMin} to {LIMITS.passwordMax} characters.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="New password" htmlFor="password">
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="New password....."
              autoComplete="new-password"
              maxLength={LIMITS.passwordMax}
            />
          </Field>
          <Field label="Confirm new password" htmlFor="confirmPassword">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Re-enter password..."
              autoComplete="new-password"
              maxLength={LIMITS.passwordMax}
            />
          </Field>
          {(formError || mutation.isError) && (
            <FormError message={formError ?? "Failed to update the password. Please try again."} />
          )}
          {mutation.isSuccess && <FormSuccess message="Password updated." />}
          <div className="flex justify-end">
            <SubmitButton pending={mutation.isPending}>Update password</SubmitButton>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
