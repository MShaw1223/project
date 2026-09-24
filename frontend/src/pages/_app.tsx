import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { Be_Vietnam_Pro } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "react-query";
import { AppShell } from "@/components/layout/AppShell";
import { PUBLIC_ROUTES } from "@/components/layout/navItems";

const bevietpro = Be_Vietnam_Pro({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal"],
});
const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const page = <Component {...pageProps} />;
  return (
    <>
      <style jsx global>{`
        :root {
          --font-sans: ${bevietpro.style.fontFamily};
        }
      `}</style>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <QueryClientProvider client={queryClient}>
          {PUBLIC_ROUTES.includes(router.pathname) ? page : <AppShell>{page}</AppShell>}
        </QueryClientProvider>
      </ThemeProvider>
    </>
  );
}
