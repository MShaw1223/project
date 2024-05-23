import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "react-query";
import { Be_Vietnam_Pro } from "next/font/google";
import Menu from "@/components/menu/menu";
import { useRouter } from "next/router";

const bevietpro = Be_Vietnam_Pro({
  subsets: ["latin"],
  weight: ["500"],
  style: ["normal"],
});
const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  return (
    <>
      <style jsx global>{`
        html {
          font-family: ${bevietpro.style.fontFamily};
        }
      `}</style>
      <QueryClientProvider client={queryClient}>
        {router.pathname !== "/" && router.pathname !== "/signUp" ? (
          <Menu />
        ) : (
          <></>
        )}
        <main>
          <Component {...pageProps} />
        </main>
      </QueryClientProvider>
    </>
  );
}
