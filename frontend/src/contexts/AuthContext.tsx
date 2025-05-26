import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Role } from '../types/index';

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  username: string | null;
  displayName: string | null;
  role: Role | null;
  login: (token: string, username: string, displayName: string, role: Role) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  isAuthenticated: false,
  isLoading: true,
  username: null,
  displayName: null,
  role: null,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');
    const storedDisplayName = localStorage.getItem('displayName');
    const storedRole = localStorage.getItem('role') as Role | null;
    if (storedToken && storedUsername) {
      setToken(storedToken);
      setUsername(storedUsername);
      setDisplayName(storedDisplayName);
      setRole(storedRole);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUsername: string, newDisplayName: string, newRole: Role) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('username', newUsername);
    localStorage.setItem('displayName', newDisplayName);
    localStorage.setItem('role', newRole);
    setToken(newToken);
    setUsername(newUsername);
    setDisplayName(newDisplayName);
    setRole(newRole);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('displayName');
    localStorage.removeItem('role');
    setToken(null);
    setUsername(null);
    setDisplayName(null);
    setRole(null);
    setIsAuthenticated(false);
  };

  const value = {
    token,
    isAuthenticated,
    isLoading,
    username,
    displayName,
    role,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};