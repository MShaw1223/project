import { useState } from "react";
import { useRouter } from "next/router";
import { useMutation } from "react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/FormField";
import { FormError } from "@/components/FormFeedback";
import { deleteAccount } from "@/lib/profile";
import { logout } from "@/lib/auth";

const CONFIRM_PHRASE = "DELETE";

const DeleteAccountSection = () => {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const mutation = useMutation(deleteAccount, {
    onSuccess: async () => {
      await logout().catch(() => undefined);
      router.push("/");
    },
  });

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="text-destructive">Delete my account</CardTitle>
        <CardDescription>
          This permanently deletes your login and all of your brokerage accounts and trades. This cannot be undone.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!confirming ? (
          <Button type="button" variant="destructive" onClick={() => setConfirming(true)}>
            Delete my account
          </Button>
        ) : (
          <div className="space-y-4">
            <Field label={`Type ${CONFIRM_PHRASE} to confirm`} htmlFor="confirmDeletion">
              <Input
                id="confirmDeletion"
                aria-label="Confirm account deletion"
                value={confirmText}
                onChange={(event) => setConfirmText(event.target.value)}
                autoComplete="off"
              />
            </Field>
            {mutation.isError && <FormError message="Failed to delete the account. Please try again." />}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="destructive"
                disabled={confirmText !== CONFIRM_PHRASE || mutation.isLoading}
                onClick={() => mutation.mutate()}
              >
                {mutation.isLoading && <Loader2 className="animate-spin" />}
                Confirm deletion
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setConfirming(false);
                  setConfirmText("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DeleteAccountSection;
