import { createContext } from "react";
import { User } from "@/types/user";

export interface UserContextValue {
  user: User | null;
  loading: boolean;
  error: boolean;
  refresh: () => Promise<void>;
}

export const UserContext = createContext<UserContextValue>({
  user: null,
  loading: true,
  error: false,
  refresh: async () => {},
});