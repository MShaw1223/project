import { FormEvent, useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, SubmitButton } from "@/components/FormField";
import { FormError, FormSuccess } from "@/components/FormFeedback";
import { ACCOUNTS_QUERY_KEY, ACCOUNT_NAME_MAX_LENGTH, createAccount } from "@/lib/accounts";

const CreateAccount = () => {
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);
  const mutation = useMutation(createAccount, {
    onSuccess: () => queryClient.invalidateQueries(ACCOUNTS_QUERY_KEY),
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const accountName = new FormData(form).get("accountName");
    const trimmed = typeof accountName === "string" ? accountName.trim() : "";
    if (trimmed === "") {
      setFormError("Enter a name for the account");
      return;
    }
    setFormError(null);
    mutation.mutate(trimmed, { onSuccess: () => form.reset() });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>New account</CardTitle>
        <CardDescription>Add a brokerage account to record trades against.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Account name" htmlFor="accountName" hint={`Up to ${ACCOUNT_NAME_MAX_LENGTH} characters`}>
            <Input id="accountName" name="accountName" placeholder="e.g. Main" maxLength={ACCOUNT_NAME_MAX_LENGTH} />
          </Field>
          {(formError || mutation.isError) && (
            <FormError message={formError ?? "Failed to create the account. Please try again."} />
          )}
          {mutation.isSuccess && <FormSuccess message="Account created." />}
          <SubmitButton pending={mutation.isLoading} className="w-full">
            <Plus />
            Create account
          </SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateAccount;
