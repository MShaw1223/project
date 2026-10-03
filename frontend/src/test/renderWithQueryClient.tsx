import { ReactElement } from "react";
import { render, RenderResult } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";

// wraps a component under test with a fresh, retry-free QueryClient so
// react-query hooks (useQuery/useMutation) work in jsdom without real timers,
// and with a router so links render
export function renderWithQueryClient(ui: ReactElement): RenderResult & { queryClient: QueryClient } {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return {
    ...render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{ui}</MemoryRouter>
      </QueryClientProvider>
    ),
    queryClient,
  };
}
