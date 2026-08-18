import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import api from "../api/axios";

// Define the shape of what this context provides
interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

// Create the context and a loader for existing sessions
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null
  })

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("token")
  })

  const [isLoading] = useState(false)

  const login = async (email: string, password: string): Promise<void> => {
    const response = await api.post("/auth/login", {email, password})
    const {token, user} = response.data

    localStorage.setItem("token", token)
    localStorage.setItem("user", JSON.stringify(user))
  }

  const signup = async (username: string, email:string, password: string): Promise<void> => {
    const response = await api.post("/auth/signup", {username, email, password})
    const {token, user} = response.data

    localStorage.setItem("token", token)
    localStorage.setItem("user", JSON.stringify(user))

    setToken(token)
    setUser(user)
  }

  const logout = ():void => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{user, token, login, signup, logout, isLoading}}>
        {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
