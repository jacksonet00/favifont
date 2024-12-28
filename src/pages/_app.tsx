import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "react-query";
import { UserProvider } from "@/providers/UserProvider";
import Header from "@/components/Header";

export default function App({ Component, pageProps }: AppProps) {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <Header />
        <Component {...pageProps} />
      </UserProvider>
    </QueryClientProvider>
  );
}
