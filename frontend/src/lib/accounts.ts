import { json, request } from "@/lib/api";

export const ACCOUNTS_QUERY_KEY = ["accounts"];

export type BrokerageAccount = {
  id: string;
  name: string;
};

export async function getAccounts(): Promise<BrokerageAccount[]> {
  const { accounts } = await request<{ accounts: BrokerageAccount[] }>("/accounts");
  return accounts;
}

export async function createAccount(name: string): Promise<BrokerageAccount> {
  const { account } = await request<{ account: BrokerageAccount }>("/accounts", json("POST", { name }));
  return account;
}

export async function updateAccount(id: string, name: string): Promise<BrokerageAccount> {
  const { account } = await request<{ account: BrokerageAccount }>(`/accounts/${id}`, json("PUT", { name }));
  return account;
}

export async function deleteAccount(id: string): Promise<void> {
  await request(`/accounts/${id}`, { method: "DELETE" });
}
