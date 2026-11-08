import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/ppap';
import { api } from '../services/api';

interface AuthContextType {
  currentUser: User;
  allUsers: User[];
  switchUser: (userId: string) => void;
  switchRole: (role: UserRole) => void;
  canApprove: (userRole?: string) => boolean;
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

const DEFAULT_USERS: User[] = [
  DEFAULT_USER,
  {
    id: 'u-2',
    name: 'Nattaporn Chaiyasin (ณัฐพร ชัยสิน)',
    email: 'nattaporn.c@autoquality.com',
    role: 'Quality Engineer',
    department: 'Quality Assurance',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    signature: 'Nattaporn C. (QE)'
  },
  {
    id: 'u-3',
    name: 'Kittisak Wongsuwan (กิตติศักดิ์ วงษ์สุวรรณ)',
    email: 'kittisak.w@autoquality.com',
    role: 'Production Engineer',
    department: 'Manufacturing Eng',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    signature: 'Kittisak W. (PE)'
  },
  {
    id: 'u-4',
    name: 'Dr. Akira Tanaka (田中 晃)',
    email: 'akira.tanaka@toyota-oem.com',
    role: 'Administrator',
    department: 'OEM Engineering & Systems',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
    signature: 'A. Tanaka (Director)'
  }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem('ppap_active_user');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_USER;
  });

  const [allUsers, setAllUsers] = useState<User[]>(DEFAULT_USERS);

  useEffect(() => {
    api.getUsers()
      .then(users => {
        if (users && users.length > 0) {
          setAllUsers(users);
          const found = users.find(u => u.id === currentUser.id);
          if (found) setCurrentUser(found);
        }
      })
      .catch(() => {
        // use fallback default users
      });
  }, []);

  const switchUser = (userId: string) => {
    const user = allUsers.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      try {
        localStorage.setItem('ppap_active_user', JSON.stringify(user));
      } catch {}
    }
  };

  const switchRole = (role: UserRole) => {
    const updated = { ...currentUser, role };
    setCurrentUser(updated);
    try {
      localStorage.setItem('ppap_active_user', JSON.stringify(updated));
    } catch {}
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