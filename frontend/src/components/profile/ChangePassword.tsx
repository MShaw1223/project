import { FormEvent, useState } from "react";
import { useMutation } from "react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, SubmitButton } from "@/components/FormField";
import { FormError, FormSuccess } from "@/components/FormFeedback";
import { Input } from "@/components/ui/input";
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH, updatePassword } from "@/lib/profile";

const ChangePassword = () => {
  const [formError, setFormError] = useState<string | null>(null);
  const mutation = useMutation(updatePassword);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const newPassword = data.get("newPassword");
    const confirmPassword = data.get("confirmPassword");
    if (typeof newPassword !== "string" || typeof confirmPassword !== "string") {
      setFormError("Enter the new password in both fields");
      return;
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH || newPassword.length > MAX_PASSWORD_LENGTH) {
      setFormError(`Password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters`);
      return;
    }
    if (newPassword !== confirmPassword) {
      setFormError("Entries do not match");
      return;
    }
    setFormError(null);
    mutation.mutate(newPassword, { onSuccess: () => form.reset() });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change password</CardTitle>
        <CardDescription>
          Use {MIN_PASSWORD_LENGTH} to {MAX_PASSWORD_LENGTH} characters.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="New password" htmlFor="newPassword">
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              placeholder="New password....."
              autoComplete="new-password"
              maxLength={MAX_PASSWORD_LENGTH}
            />
          </Field>
          <Field label="Confirm new password" htmlFor="confirmPassword">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Re-enter password..."
              autoComplete="new-password"
              maxLength={MAX_PASSWORD_LENGTH}
            />
          </Field>
          {(formError || mutation.isError) && (
            <FormError message={formError ?? "Failed to update the password. Please try again."} />
          )}
          {mutation.isSuccess && <FormSuccess message="Password updated." />}
          <div className="flex justify-end">
            <SubmitButton pending={mutation.isLoading}>Update password</SubmitButton>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ChangePassword;
