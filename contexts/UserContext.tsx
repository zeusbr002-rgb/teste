import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { ADMIN_USER, CURRENT_USER } from '../services/mockData';

interface UserContextType {
  user: User | null;
  allUsers: User[];
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
  updateProfile: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  // Initialize from LocalStorage or Mock Data
  useEffect(() => {
    const storedUsers = localStorage.getItem('omni_users');
    const storedSession = localStorage.getItem('omni_session_user');

    let initialUsers: User[] = [];

    if (storedUsers) {
      initialUsers = JSON.parse(storedUsers);
    } else {
      // Seed with mock data if empty
      // Ensure mock users have passwords for testing if needed, though they skip check via specific logic or assumed match in dev
      const seededAdmin = { ...ADMIN_USER, password: 'admin123' }; // Fallback pass
      const seededWorker = { ...CURRENT_USER, password: 'user123' };
      
      initialUsers = [seededAdmin, seededWorker];
      localStorage.setItem('omni_users', JSON.stringify(initialUsers));
    }

    setAllUsers(initialUsers);

    if (storedSession) {
      setUser(JSON.parse(storedSession));
    }
  }, []);

  const saveUsers = (users: User[]) => {
    setAllUsers(users);
    localStorage.setItem('omni_users', JSON.stringify(users));
  };

  const login = async (email: string, pass: string): Promise<boolean> => {
    // 1. Hardcoded Super Admin Backdoor (Requested Requirement)
    if (email === 'cops@cops.com' && pass === 'cops1234') {
      let foundUser = allUsers.find(u => u.email === 'cops@cops.com');
      
      if (!foundUser) {
        // Create the Super Admin if it doesn't exist in local storage yet
        foundUser = { 
          ...ADMIN_USER, 
          id: 'admin_master', 
          email: 'cops@cops.com', 
          name: 'Super Gestor',
          password: 'cops1234'
        };
        const newUsers = [...allUsers, foundUser];
        saveUsers(newUsers);
      }

      // Ensure role is ADMIN in session
      const sessionUser = { ...foundUser, role: UserRole.ADMIN };
      
      setUser(sessionUser);
      localStorage.setItem('omni_session_user', JSON.stringify(sessionUser));
      localStorage.setItem('userRole', UserRole.ADMIN);
      return true;
    }

    // 2. Standard User Login
    const foundUser = allUsers.find(u => u.email === email);

    if (foundUser) {
      // If user has a password set, verify it. 
      // For mock users without password field, we might allow access (dev mode), 
      // but strictly we should check.
      if (foundUser.password && foundUser.password !== pass) {
        return false;
      }
      
      setUser(foundUser);
      localStorage.setItem('omni_session_user', JSON.stringify(foundUser));
      localStorage.setItem('userRole', foundUser.role);
      return true;
    }

    return false;
  };

  const register = async (name: string, email: string, password: string) => {
    const newUser: User = {
      id: `usr_${Date.now()}`,
      name,
      email,
      role: UserRole.WORKER, // Default role
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
      password: password // Save password for future logins
    };

    const updatedUsers = [...allUsers, newUser];
    saveUsers(updatedUsers);
    
    // Auto login after register
    setUser(newUser);
    localStorage.setItem('omni_session_user', JSON.stringify(newUser));
    localStorage.setItem('userRole', newUser.role);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('omni_session_user');
    localStorage.removeItem('userRole');
  };

  const updateProfile = (id: string, updates: Partial<User>) => {
    const updatedList = allUsers.map(u => {
      if (u.id === id) {
        return { ...u, ...updates };
      }
      return u;
    });

    saveUsers(updatedList);

    // If updating self, update session
    if (user && user.id === id) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('omni_session_user', JSON.stringify(updatedUser));
      if (updates.role) {
         localStorage.setItem('userRole', updates.role);
      }
    }
  };

  const deleteUser = (id: string) => {
    const updatedList = allUsers.filter(u => u.id !== id);
    saveUsers(updatedList);
  };

  return (
    <UserContext.Provider value={{ user, allUsers, login, logout, register, updateProfile, deleteUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};