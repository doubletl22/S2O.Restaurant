"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  // Tạo instance QueryClient một lần duy nhất khi component mount
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Tắt tính năng tự fetch lại khi focus window (tùy chọn)
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}