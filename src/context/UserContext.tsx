import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { User } from "@/types/user"
import { ProfileService } from "@/services/profileService"
import { getToken } from "@/utils/auth"

interface UserContextValue {
  user: User | null
  loading: boolean
  error: boolean
  refresh: () => Promise<void>
}

const UserContext = createContext<UserContextValue>({
  user: null,
  loading: true,
  error: false,
  refresh: async () => {},
})

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const load = async () => {
    if (!getToken()) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      setError(false)
      setUser(await ProfileService.getMe())
    } catch {
      setError(true)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <UserContext.Provider value={{ user, loading, error, refresh: load }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)