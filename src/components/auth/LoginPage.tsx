import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  KeyRound,
  Layers,
  FileCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const res = await login(username, password);
      if (!res.success) {
        setErrorMsg(res.error || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickFill = () => {
    setUsername('admin');
    setPassword('admin123');
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans text-slate-100">
      
      {/* Background ambient lighting */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative z-10 space-y-6">
        
        {/* Header with Automotive IATF 16949 Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-inner">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              PPAP Management System
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Automotive Quality Management System (IATF 16949 / AIAG 4th)
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-start space-x-2 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Username */}
          <div className="space-y-1.5">
            <label className="block text-slate-300 font-semibold">
              ชื่อผู้ใช้ (Username หรือ Email)
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="กรอกชื่อผู้ใช้ เช่น admin"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-xs font-medium"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-slate-300 font-semibold">
              รหัสผ่าน (Password)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="กรอกรหัสผ่าน เช่น admin123"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-xs font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <div className="flex items-center justify-between text-[11px]">
            <label className="flex items-center space-x-2 text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-blue-500 focus:ring-0"
              />
              <span>จดจำการเข้าสู่ระบบ</span>
            </label>
            <span className="text-slate-500 hover:text-slate-400 cursor-pointer">
              ต้องการความช่วยเหลือ?
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs tracking-wide transition flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/20 disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            <span>{isSubmitting ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ (Sign In)'}</span>
          </button>

        </form>

        {/* Quick Credentials Info Box for User */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-400">
              <KeyRound className="w-3.5 h-3.5" />
              <span>บัญชีผู้ใช้ระบบ (Authorized Admin Credentials)</span>
            </div>
            <button
              type="button"
              onClick={handleQuickFill}
              className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold underline"
            >
              กรอกอัตโนมัติ
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60">
            <div>
              <span className="text-slate-500 block text-[10px]">Username:</span>
              <strong className="text-slate-200 font-mono">admin</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Password:</span>
              <strong className="text-slate-200 font-mono">admin123</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">ชื่อผู้ใช้:</span>
              <strong className="text-slate-200">Narin chansuk</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Email:</span>
              <strong className="text-slate-200 truncate block">Narin.admin@gmail.com</strong>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 text-[10px] text-slate-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>สิทธิ์ระดับ: <strong>Administrator</strong> (ควบคุมระบบ PPAP 18 Elements ครบวงจร)</span>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-[10px] text-slate-500 border-t border-slate-800/60 pt-3">
          ระบบจัดทำและควบคุมเอกสารอนุมัติชิ้นส่วนยานยนต์ตามมาตรฐาน IATF 16949
        </div>

      </div>

    </div>
  );
};
