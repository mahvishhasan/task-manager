import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Index from "./pages/index";
import { Toaster } from "./components/ui/toaster";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: 1 },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Index />
      <Toaster />
    </QueryClientProvider>
  );
}
