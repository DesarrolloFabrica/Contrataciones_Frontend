import { QueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";

const FIVE_MINUTES = 1000 * 60 * 5;
const TEN_MINUTES = 1000 * 60 * 10;
const THIRTY_MINUTES = 1000 * 60 * 30;

function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (failureCount >= 1) return false;
  const status = (error as AxiosError | undefined)?.response?.status;
  if (typeof status === "number" && status >= 400 && status < 500) return false;
  return true;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: FIVE_MINUTES,
      gcTime: THIRTY_MINUTES,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: shouldRetryQuery,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    },
    mutations: {
      retry: 0,
    },
  },
});

export const QUERY_TIMINGS = {
  staleTime: {
    short: TEN_MINUTES,
    medium: THIRTY_MINUTES,
    long: 1000 * 60 * 60,
  },
  gcTime: {
    short: TEN_MINUTES,
    medium: THIRTY_MINUTES,
    long: 1000 * 60 * 60 * 2,
  },
} as const;
