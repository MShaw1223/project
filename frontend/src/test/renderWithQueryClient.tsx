import { ReactElement } from "react";
import { render, RenderResult } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";

// wraps a component under test with a fresh, retry-free QueryClient so
// react-query hooks (useQuery/useMutation) work in jsdom without real timers
export function renderWithQueryClient(ui: ReactElement): RenderResult {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}
