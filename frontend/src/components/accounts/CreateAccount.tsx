import { FormEvent, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, SubmitButton } from "@/components/form/FormField";
import { FormError, FormSuccess } from "@/components/form/FormFeedback";
import { ACCOUNTS_QUERY_KEY, createAccount } from "@/lib/accounts";
import { LIMITS, accountNameSchema, parseForm } from "@/lib/validation";

export const CreateAccount = () => {
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);
  const mutation = useMutation({
    mutationFn: createAccount,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ACCOUNTS_QUERY_KEY }),
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const parsed = parseForm(accountNameSchema, form);
    setFormError(parsed.error ?? null);
    if (parsed.data) mutation.mutate(parsed.data.name, { onSuccess: () => form.reset() });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>New account</CardTitle>
        <CardDescription>Add a brokerage account to record trades against.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Account name" htmlFor="accountName" hint={`Up to ${LIMITS.accountNameMax} characters`}>
            <Input id="accountName" name="name" placeholder="e.g. Main" maxLength={LIMITS.accountNameMax} />
          </Field>
          {(formError || mutation.isError) && (
            <FormError message={formError ?? "Failed to create the account. Please try again."} />
          )}
          {mutation.isSuccess && <FormSuccess message="Account created." />}
          <SubmitButton pending={mutation.isPending} className="w-full">
            <Plus />
            Create account
          </SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
};
