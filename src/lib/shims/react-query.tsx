import { createContext } from 'react';

const QueryContext = createContext<any>(null);

export class QueryClient {}

export function QueryClientProvider({ children }: any) {
  return <QueryContext.Provider value={{}}>{children}</QueryContext.Provider>;
}

export function useQuery(_options: any) {
  return {
    data: undefined as any,
    isLoading: false,
    error: null,
    refetch: async () => {}
  };
}

export function useMutation(_options: any) {
  return {
    mutate: (_variables: any) => {},
    mutateAsync: async (_variables: any) => {},
    isLoading: false,
    error: null
  };
}
