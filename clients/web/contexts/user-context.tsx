'use client'
import httpClient from "@/lib/http-client";
import { User } from "@/types/entities";
import { ReactQueryKeys } from "@/types/react-query";
import { useQuery } from "@tanstack/react-query";
import React, { createContext, useContext } from "react";

interface UserContextProps {
  isLoading: boolean;
  data: User | null;
}
export const UserContext = createContext<UserContextProps>({
  isLoading: false,
  data: null
});

export function UserContextProvider({ children }: { children: React.ReactNode }) {
  const { isLoading, data } = useQuery({
    queryKey: [ReactQueryKeys.ME],
    queryFn: () => httpClient.me(),
    select: (data) => data.data,
  })

  return (
    <UserContext.Provider value={{ isLoading, data: data || null }}>
      {children}
    </UserContext.Provider>
  );
}

export function useMe() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useMe must be used within a UserContextProvider");
  }
  return { user: context.data as User };
}