import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ACCOUNTS_QUERY_KEY, getAccounts } from "@/lib/accounts";

interface AccountSelectProps {
  value: string;
  onChange: (accountId: string) => void;
  id?: string;
}

// lists the signed in user's accounts from the Go backend, reporting the selected account's id
export function AccountSelect({ value, onChange, id }: AccountSelectProps) {
  const { data: accounts = [], isLoading, isError } = useQuery({ queryKey: ACCOUNTS_QUERY_KEY, queryFn: getAccounts });
  if (isError) return <p className="text-sm text-destructive">Failed to load your accounts.</p>;
  return (
    <Select value={value} onValueChange={onChange} disabled={isLoading}>
      <SelectTrigger id={id}>
        <SelectValue placeholder={isLoading ? "Loading..." : "Account"} />
      </SelectTrigger>
      <SelectContent>
        {accounts.map((account) => (
          <SelectItem key={account.id} value={account.id}>
            {account.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
