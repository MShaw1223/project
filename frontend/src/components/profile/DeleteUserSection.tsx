import { useState } from "react";
import { useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/form/FormField";
import { FormError } from "@/components/form/FormFeedback";
import { deleteUser } from "@/lib/profile";
import { ROUTES } from "@/lib/routes";

const CONFIRM_PHRASE = "DELETE";

export const DeleteUserSection = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirming, setConfirming] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const mutation = useMutation({
    mutationFn: deleteUser,
    // the backend already cleared the session cookie; leave the signed-in pages, then drop the cache
    onSuccess: async () => {
      await navigate(ROUTES.login);
      queryClient.clear();
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
                disabled={confirmText !== CONFIRM_PHRASE || mutation.isPending}
                onClick={() => mutation.mutate()}
              >
                {mutation.isPending && <Loader2 className="animate-spin" />}
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
