import React, { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
  isAuthenticated: boolean;
  roleId: number | null;
  token: string | null;
  loading: boolean; // <-- Agregado
  login: (token: string, roleId: number | null | undefined) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [roleId, setRoleId] = useState<number | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // <-- Nuevo estado

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const savedRoleId = localStorage.getItem("roleId");

    if (storedToken) {
      setIsAuthenticated(true);
      setToken(storedToken);
    }

    if (savedRoleId) {
      setRoleId(parseInt(savedRoleId));
    }

    setLoading(false); // <-- Indica que terminó de cargar la info
  }, []);

  const login = (token: string, role: number | null | undefined) => {
    if (!token) {
      return;
    }

    localStorage.setItem("token", token);
    setToken(token);

    if (role !== undefined && role !== null) {
      localStorage.setItem("roleId", role.toString());
      setRoleId(role);
    } else {
      localStorage.setItem("roleId", "1");
      setRoleId(1);
    }

    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("roleId");
    setIsAuthenticated(false);
    setRoleId(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, roleId, token, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
