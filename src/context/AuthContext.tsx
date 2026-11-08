import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/ppap';
import { api } from '../services/api';

export const ADMIN_USER: User = {
  id: 'u-admin-narin',
  name: 'Narin chansuk',
  email: 'Narin.admin@gmail.com',
  username: 'admin',
  password: 'admin123',
  role: 'Administrator',
  department: 'Quality Assurance & Plant Management',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  signature: 'Narin Chansuk (Administrator)',
  isActive: true,
  createdAt: '2026-01-01T00:00:00.000Z'
};

const DEFAULT_USERS: User[] = [
  ADMIN_USER,
  {
    id: 'u-1',
    name: 'Somchai Prasert (สมชาย ประเสริฐ)',
    email: 'somchai.p@autoquality.com',
    username: 'somchai',
    password: 'admin123',
    role: 'Quality Manager',
    department: 'Quality Assurance',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    signature: 'Somchai Prasert (QA Mgr)',
    isActive: true,
    createdAt: '2026-01-10T00:00:00.000Z'
  },
  {
    id: 'u-2',
    name: 'Nattaporn Chaiyasin (ณัฐพร ชัยสิน)',
    email: 'nattaporn.c@autoquality.com',
    username: 'nattaporn',
    password: 'admin123',
    role: 'Quality Engineer',
    department: 'Quality Assurance',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    signature: 'Nattaporn C. (QE)',
    isActive: true,
    createdAt: '2026-01-15T00:00:00.000Z'
  },
  {
    id: 'u-3',
    name: 'Kittisak Wongsuwan (กิตติศักดิ์ วงษ์สุวรรณ)',
    email: 'kittisak.w@autoquality.com',
    username: 'kittisak',
    password: 'admin123',
    role: 'Production Engineer',
    department: 'Manufacturing Eng',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    signature: 'Kittisak W. (PE)',
    isActive: true,
    createdAt: '2026-02-01T00:00:00.000Z'
  },
  {
    id: 'u-4',
    name: 'Dr. Akira Tanaka (田中 晃)',
    email: 'akira.tanaka@toyota-oem.com',
    username: 'akira',
    password: 'admin123',
    role: 'Administrator',
    department: 'OEM Engineering & Systems',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
    signature: 'A. Tanaka (Director)',
    isActive: true,
    createdAt: '2026-02-15T00:00:00.000Z'
  }
];

interface AuthContextType {
  currentUser: User;
  allUsers: User[];
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchUser: (userId: string) => void;
  switchRole: (role: UserRole) => void;
  createUser: (userData: Omit<User, 'id'>) => Promise<User>;
  updateUser: (userId: string, updates: Partial<User>) => Promise<User>;
  deleteUser: (userId: string) => Promise<boolean>;
  canApprove: (userRole?: string) => boolean;
  canEdit: () => boolean;
  canCreateProject: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Authentication status
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('ppap_authenticated') === 'true';
    } catch {
      return false;
    }
  });

  // Users list from localStorage or defaults
  const [allUsers, setAllUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('ppap_users_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Ensure Narin admin user exists in list
          if (!parsed.some(u => u.email === ADMIN_USER.email || u.username === 'admin')) {
            return [ADMIN_USER, ...parsed];
          }
          return parsed;
        }
      }
    } catch {}
    return DEFAULT_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem('ppap_active_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    return ADMIN_USER;
  });

  // Sync users to localStorage whenever allUsers changes
  const persistUsers = (usersList: User[]) => {
    setAllUsers(usersList);
    try {
      localStorage.setItem('ppap_users_v2', JSON.stringify(usersList));
    } catch {}
  };

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      return { success: false, error: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' };
    }

    // Check all users in database/state
    const matched = allUsers.find(
      u =>
        (u.username?.toLowerCase() === cleanUser || u.email?.toLowerCase() === cleanUser)
    );

    if (matched) {
      if (matched.isActive === false) {
        return { success: false, error: 'บัญชีผู้ใช้นี้ถูกระงับการใช้งาน กรุณาติดต่อ Administrator' };
      }

      // Check password
      const userPass = matched.password || 'admin123';
      if (userPass === cleanPass) {
        setCurrentUser(matched);
        setIsAuthenticated(true);
        try {
          localStorage.setItem('ppap_authenticated', 'true');
          localStorage.setItem('ppap_active_user', JSON.stringify(matched));
        } catch {}
        return { success: true };
      } else {
        return { success: false, error: 'รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง' };
      }
    }

    // Hardcoded fallback for admin
    if (
      (cleanUser === 'admin' || cleanUser === 'narin.admin@gmail.com' || cleanUser === 'narin') &&
      cleanPass === 'admin123'
    ) {
      setCurrentUser(ADMIN_USER);
      setIsAuthenticated(true);
      try {
        localStorage.setItem('ppap_authenticated', 'true');
        localStorage.setItem('ppap_active_user', JSON.stringify(ADMIN_USER));
      } catch {}
      return { success: true };
    }

    return {
      success: false,
      error: 'ไม่พบบัญชีผู้ใช้นี้ในระบบ กรุณาตรวจสอบชื่อผู้ใช้หรือติดต่อ Administrator'
    };
  };

  const logout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('ppap_authenticated');
    } catch {}
  };

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

  // Administrator CRUD operations
  const createUser = async (userData: Omit<User, 'id'>): Promise<User> => {
    const cleanUsername = (userData.username || '').trim().toLowerCase();
    
    // Check duplicate username
    if (cleanUsername && allUsers.some(u => (u.username || '').toLowerCase() === cleanUsername)) {
      throw new Error(`ชื่อผู้ใช้ (Username) "${userData.username}" มีอยู่ในระบบแล้ว กรุณาเลือกชื่อผู้ใช้อื่น`);
    }

    // Check duplicate email
    const cleanEmail = userData.email.trim().toLowerCase();
    if (allUsers.some(u => u.email.toLowerCase() === cleanEmail)) {
      throw new Error(`อีเมล "${userData.email}" มีอยู่ในระบบแล้ว`);
    }

    const newUser: User = {
      ...userData,
      id: `u-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      username: userData.username?.trim() || cleanEmail.split('@')[0],
      password: userData.password?.trim() || 'admin123',
      isActive: userData.isActive !== false,
      createdAt: new Date().toISOString()
    };

    const updated = [...allUsers, newUser];
    persistUsers(updated);
    return newUser;
  };

  const updateUser = async (userId: string, updates: Partial<User>): Promise<User> => {
    let updatedTarget: User | null = null;

    // Check duplicate username if username is changing
    if (updates.username) {
      const cleanUsername = updates.username.trim().toLowerCase();
      const existing = allUsers.find(
        u => u.id !== userId && (u.username || '').toLowerCase() === cleanUsername
      );
      if (existing) {
        throw new Error(`ชื่อผู้ใช้ "${updates.username}" ซ้ำกับผู้ใช้อื่นในระบบ`);
      }
    }

    const updatedList = allUsers.map(u => {
      if (u.id === userId) {
        updatedTarget = {
          ...u,
          ...updates,
          username: updates.username !== undefined ? updates.username.trim() : u.username,
          password: updates.password !== undefined ? updates.password.trim() : u.password
        };
        return updatedTarget;
      }
      return u;
    });

    if (!updatedTarget) {
      throw new Error('ไม่พบผู้ใช้ที่ต้องการแก้ไข');
    }

    persistUsers(updatedList);

    // If updating current active user, sync currentUser
    if (currentUser.id === userId) {
      setCurrentUser(updatedTarget);
      try {
        localStorage.setItem('ppap_active_user', JSON.stringify(updatedTarget));
      } catch {}
    }

    return updatedTarget;
  };

  const deleteUser = async (userId: string): Promise<boolean> => {
    if (userId === currentUser.id) {
      throw new Error('ไม่สามารถลบบัญชี Administrator ที่คุณกำลังเข้าสู่ระบบอยู่ได้');
    }
    if (userId === ADMIN_USER.id) {
      throw new Error('ไม่สามารถลบบัญชี Primary Administrator หลักของระบบได้');
    }

    const filtered = allUsers.filter(u => u.id !== userId);
    persistUsers(filtered);
    return true;
  };

  const isAdmin = currentUser.role === 'Administrator';

  const canApprove = () => {
    return ['Administrator', 'Quality Manager'].includes(currentUser.role);
  };

  const canEdit = () => {
    return [
      'Administrator',
      'Quality Manager',
      'Quality Engineer',
      'Production Engineer',
      'R&D Engineer',
      'Inspector'
    ].includes(currentUser.role);
  };

  const canCreateProject = () => {
    return ['Administrator', 'Quality Manager', 'Quality Engineer'].includes(currentUser.role);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allUsers,
        isAuthenticated,
        isAdmin,
        login,
        logout,
        switchUser,
        switchRole,
        createUser,
        updateUser,
        deleteUser,
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