"use client";

import {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import nookies from "nookies";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [lastActivityTime, setLastActivityTime] = useState<number>(Date.now());
  const router = useRouter();

  useEffect(() => {
    const cookies = nookies.get();
    if (cookies.authToken) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const login = (username: string, password: string) => {
    const u = process.env.NEXT_PUBLIC_USERNME!;
    const p = process.env.NEXT_PUBLIC_PASSWORD!;
    if (username === u && password === p) {
      nookies.set(null, "authToken", "your-auth-token", {
        maxAge: 60 * 60 * 24,
        path: "/",
      });
      setIsAuthenticated(true);
      setLastActivityTime(Date.now());
      router.push("/");
    } else {
      alert("Invalid credentials");
    }
  };

  const logout = () => {
    nookies.destroy(null, "authToken");
    setIsAuthenticated(false);
    router.push("/login");
  };

  useEffect(() => {
    const checkInactivity = () => {
      const now = Date.now();
      if (now - lastActivityTime > 60 * 1000) {
        logout();
      }
    };

    const activityEvents = ["click", "mousemove", "keydown", "scroll"];
    const updateLastActivityTime = () => setLastActivityTime(Date.now());

    activityEvents.forEach((event) =>
      window.addEventListener(event, updateLastActivityTime)
    );

    const intervalId = setInterval(checkInactivity, 1000);

    return () => {
      clearInterval(intervalId);
      activityEvents.forEach((event) =>
        window.removeEventListener(event, updateLastActivityTime)
      );
    };
  }, [lastActivityTime]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
