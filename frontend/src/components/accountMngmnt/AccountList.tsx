import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Check, Loader2, Pencil, Trash2, Wallet, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { FormError } from "@/components/FormFeedback";
import {
  ACCOUNTS_QUERY_KEY,
  ACCOUNT_NAME_MAX_LENGTH,
  BrokerageAccount,
  deleteAccount,
  getAccounts,
  updateAccount,
} from "@/lib/accounts";

type RowMode = "view" | "rename" | "delete";

function AccountRow({ account }: { account: BrokerageAccount }) {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<RowMode>("view");
  const [renameError, setRenameError] = useState<string | null>(null);
  const refresh = () => queryClient.invalidateQueries(ACCOUNTS_QUERY_KEY);

  const rename = useMutation((name: string) => updateAccount(account.id, name), {
    onSuccess: () => {
      setMode("view");
      return refresh();
    },
  });
  const remove = useMutation(() => deleteAccount(account.id), { onSuccess: refresh });

  function reset(next: RowMode) {
    setMode(next);
    setRenameError(null);
    rename.reset();
    remove.reset();
  }

  function handleRename(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = new FormData(event.currentTarget).get("name");
    const trimmed = typeof name === "string" ? name.trim() : "";
    if (trimmed === "") {
      setRenameError("Enter a name for the account");
      return;
    }
    if (trimmed === account.name) {
      reset("view");
      return;
    }
    setRenameError(null);
    rename.mutate(trimmed);
  }

  const error =
    renameError ??
    (rename.isError ? "Failed to rename the account. Please try again." : null) ??
    (remove.isError ? "Failed to delete the account. Please try again." : null);

  return (
    <li className="space-y-3 py-3 first:pt-0 last:pb-0">
      {mode === "rename" ? (
        <form onSubmit={handleRename} className="flex items-center gap-2">
          <Input
            name="name"
            aria-label={`New name for ${account.name}`}
            defaultValue={account.name}
            maxLength={ACCOUNT_NAME_MAX_LENGTH}
            autoFocus
            className="h-9"
          />
          <Button type="submit" size="sm" disabled={rename.isLoading}>
            {rename.isLoading ? <Loader2 className="animate-spin" /> : <Check />}
            Save
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => reset("view")}>
            Cancel
          </Button>
        </form>
      ) : (
        <div className="flex min-h-9 items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
            <Wallet className="size-4 text-muted-foreground" />
          </div>
          <span className="flex-1 truncate font-medium">{account.name}</span>
          {mode === "view" && (
            <div className="flex gap-1">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-8 text-muted-foreground"
                aria-label={`Rename ${account.name}`}
                onClick={() => reset("rename")}
              >
                <Pencil />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-8 text-muted-foreground hover:text-destructive"
                aria-label={`Delete ${account.name}`}
                onClick={() => reset("delete")}
              >
                <Trash2 />
              </Button>
            </div>
          )}
        </div>
      )}
      {mode === "delete" && (
        <div className="flex flex-col gap-3 rounded-md border border-destructive/50 p-3 sm:flex-row sm:items-center">
          <p className="flex-1 text-sm">
            Delete <strong>{account.name}</strong> and every trade recorded on it? This cannot be undone.
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="destructive"
              disabled={remove.isLoading}
              onClick={() => remove.mutate()}
            >
              {remove.isLoading && <Loader2 className="animate-spin" />}
              Delete
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => reset("view")}>
              <X />
              Cancel
            </Button>
          </div>
        </div>
      )}
      {error && <FormError message={error} />}
    </li>
  );
}

function AccountList() {
  const { data: accounts = [], isLoading, isError } = useQuery(ACCOUNTS_QUERY_KEY, getAccounts);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your accounts</CardTitle>
        <CardDescription>
          {accounts.length === 1 ? "1 account" : `${accounts.length} accounts`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-9 w-full" />
            ))}
          </div>
        ) : isError ? (
          <FormError message="Failed to load your accounts." />
        ) : accounts.length === 0 ? (
          <div className="flex h-32 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
            No accounts yet. Create one to start recording trades.
          </div>
        ) : (
          <ul className="divide-y">
            {accounts.map((account) => (
              <AccountRow key={account.id} account={account} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export default AccountList;
