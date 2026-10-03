import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Field, SubmitButton } from "@/components/form/FormField";
import { FormError, FormSuccess } from "@/components/form/FormFeedback";
import { ApiError } from "@/lib/api";
import { PROFILE_QUERY_KEY, getProfile, updateUsername } from "@/lib/profile";
import { LIMITS, parseForm, usernameSchema } from "@/lib/validation";

function mutationErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 409) return "That username is already taken.";
  return "Failed to save the username. Please try again.";
}

export const UsernameForm = () => {
  const queryClient = useQueryClient();
  const profileQuery = useQuery({ queryKey: PROFILE_QUERY_KEY, queryFn: getProfile });
  const [formError, setFormError] = useState<string | null>(null);
  const mutation = useMutation({
    mutationFn: updateUsername,
    onSuccess: (profile) => {
      queryClient.setQueryData(PROFILE_QUERY_KEY, profile);
    },
  });
  const current = profileQuery.data?.username ?? null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = parseForm(usernameSchema, event.currentTarget);
    setFormError(parsed.error ?? null);
    if (parsed.data) mutation.mutate(parsed.data.username);
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
                maxLength={LIMITS.usernameMax}
              />
            </Field>
            {(formError || mutation.isError) && (
              <FormError message={formError ?? mutationErrorMessage(mutation.error)} />
            )}
            {mutation.isSuccess && <FormSuccess message="Username saved." />}
            <div className="flex justify-end">
              <SubmitButton pending={mutation.isPending}>{current ? "Change username" : "Save username"}</SubmitButton>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};
