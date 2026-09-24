import { BACKEND_PREFIX } from "@/lib/auth";

export const ACCOUNT_NAME_MAX_LENGTH = 15;
export const ACCOUNTS_QUERY_KEY = ["accounts"];

export type BrokerageAccount = {
  id: string;
  name: string;
};

// every call authenticates with the httpOnly session cookie the backend set at login
async function request(path: string, init?: RequestInit): Promise<Response> {
  const response = await fetch(`${BACKEND_PREFIX}${path}`, {
    cache: "no-store",
    ...init,
  });
  if (!response.ok) {
    const { error } = await response.json().catch(() => ({ error: undefined }));
    throw new Error(error ?? `request failed: ${response.status}`);
  }
  return response;
}

const jsonBody = (name: string): RequestInit => ({
  body: JSON.stringify({ name }),
  headers: { "Content-Type": "application/json" },
});

export async function getAccounts(): Promise<BrokerageAccount[]> {
  const response = await request("/accounts");
  const { accounts } = await response.json();
  return accounts as BrokerageAccount[];
}

export async function createAccount(name: string): Promise<BrokerageAccount> {
  const response = await request("/accounts", { method: "POST", ...jsonBody(name) });
  const { account } = await response.json();
  return account as BrokerageAccount;
}

export async function updateAccount(id: string, name: string): Promise<BrokerageAccount> {
  const response = await request(`/accounts/${id}`, { method: "PUT", ...jsonBody(name) });
  const { account } = await response.json();
  return account as BrokerageAccount;
}

export async function deleteAccount(id: string): Promise<void> {
  await request(`/accounts/${id}`, { method: "DELETE" });
}
