import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/ppap';
import { api } from '../services/api';

interface AuthContextType {
  currentUser: User;
  allUsers: User[];
  switchUser: (userId: string) => void;
  switchRole: (role: UserRole) => void;
  canApprove: () => boolean;
  canEdit: () => boolean;
  canCreateProject: () => boolean;
}

const DEFAULT_USER: User = {
  id: 'u-1',
  name: 'Somchai Prasert (สมชาย ประเสริฐ)',
  email: 'somchai.p@autoquality.com',
  role: 'Quality Manager',
  department: 'Quality Assurance',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  signature: 'Somchai Prasert (QA Mgr)'
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('ppap_active_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return DEFAULT_USER;
  });

  const [allUsers, setAllUsers] = useState<User[]>([DEFAULT_USER]);

  useEffect(() => {
    api.getUsers()
      .then(users => {
        if (users && users.length > 0) {
          setAllUsers(users);
          const found = users.find(u => u.id === currentUser.id);
          if (found) {
            setCurrentUser(found);
          }
        }
      })
      .catch(err => console.warn('Could not fetch users list:', err));
  }, []);

  const switchUser = (userId: string) => {
    const user = allUsers.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('ppap_active_user', JSON.stringify(user));
    }
  };

  const switchRole = (role: UserRole) => {
    const updated = { ...currentUser, role };
    setCurrentUser(updated);
    localStorage.setItem('ppap_active_user', JSON.stringify(updated));
  };

  const canApprove = () => {
    return ['Administrator', 'Quality Manager'].includes(currentUser.role);
  };

  const canEdit = () => {
    return ['Administrator', 'Quality Manager', 'Quality Engineer', 'Production Engineer', 'R&D Engineer', 'Inspector'].includes(currentUser.role);
  };

  const canCreateProject = () => {
    return ['Administrator', 'Quality Manager', 'Quality Engineer'].includes(currentUser.role);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allUsers,
        switchUser,
        switchRole,
        canApprove,
        canEdit,
        canCreateProject
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
