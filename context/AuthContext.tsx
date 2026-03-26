import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { StorageService } from "@/services/storage";

interface AuthContextType {
  user: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = useCallback(async () => {
    try {
      const token = await StorageService.getToken();
      const userData = await StorageService.getUserData();
      if (token && userData) {
        setUser(userData);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    // Validation
    if (!email || !password) {
      throw new Error("Email and password are required");
    }
    if (!email.includes("@")) {
      throw new Error("Please enter a valid email");
    }
    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    // Simulate API call with FakeStoreAPI user validation
    const response = await fetch("https://fakestoreapi.com/users");
    const users = await response.json();
    const foundUser = users.find((u: any) => u.email === email);

    if (!foundUser) {
      throw new Error("Invalid credentials");
    }

    const userData = {
      id: foundUser.id,
      name: foundUser.name.firstname + " " + foundUser.name.lastname,
      email: foundUser.email,
      avatar: null,
    };

    // Store securely
    await StorageService.setToken("fake-jwt-token-" + foundUser.id);
    await StorageService.setUserData(userData);
    setUser(userData);
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      if (!name || !email || !password) {
        throw new Error("All fields are required");
      }
      if (!email.includes("@")) {
        throw new Error("Please enter a valid email");
      }
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      // Simulate registration
      const userData = {
        id: Date.now().toString(),
        name,
        email,
        avatar: null,
      };

      await StorageService.setToken("fake-jwt-token-" + userData.id);
      await StorageService.setUserData(userData);
      setUser(userData);
    },
    [],
  );

  const logout = useCallback(async () => {
    await StorageService.removeToken();
    await StorageService.removeUserData();
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async (data: any) => {
      const updatedUser = { ...user, ...data };
      await StorageService.setUserData(updatedUser);
      setUser(updatedUser);
    },
    [user],
  );

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
