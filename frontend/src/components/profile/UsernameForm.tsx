import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Field, SubmitButton } from "@/components/FormField";
import { FormError, FormSuccess } from "@/components/FormFeedback";
import {
  ApiError,
  PROFILE_QUERY_KEY,
  USERNAME_MAX_LENGTH,
  USERNAME_PATTERN,
  getProfile,
  updateUsername,
} from "@/lib/profile";

function mutationErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 409) return "That username is already taken.";
  return "Failed to save the username. Please try again.";
}

const UsernameForm = () => {
  const queryClient = useQueryClient();
  const profileQuery = useQuery(PROFILE_QUERY_KEY, getProfile);
  const [formError, setFormError] = useState<string | null>(null);
  const mutation = useMutation(updateUsername, {
    onSuccess: (profile) => {
      queryClient.setQueryData(PROFILE_QUERY_KEY, profile);
    },
  });
  const current = profileQuery.data?.username ?? null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const username = new FormData(event.currentTarget).get("username");
    const trimmed = typeof username === "string" ? username.trim() : "";
    if (!USERNAME_PATTERN.test(trimmed)) {
      setFormError("Use 3-20 letters, numbers or underscores");
      return;
    }
    setFormError(null);
    mutation.mutate(trimmed);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Username</CardTitle>
        <CardDescription>
          {current ? `You're signed in as ${current}.` : "Choose a username to show instead of your email."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {profileQuery.isLoading ? (
          <Skeleton className="h-10 w-full" />
        ) : profileQuery.isError ? (
          <FormError message="Failed to load your profile." />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Username" htmlFor="username" hint="3-20 letters, numbers or underscores">
              <Input
                id="username"
                name="username"
                defaultValue={current ?? ""}
                placeholder="e.g. trader_1"
                autoComplete="username"
                maxLength={USERNAME_MAX_LENGTH}
              />
            </Field>
            {(formError || mutation.isError) && (
              <FormError message={formError ?? mutationErrorMessage(mutation.error)} />
            )}
            {mutation.isSuccess && <FormSuccess message="Username saved." />}
            <div className="flex justify-end">
              <SubmitButton pending={mutation.isLoading}>{current ? "Change username" : "Save username"}</SubmitButton>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default UsernameForm;
