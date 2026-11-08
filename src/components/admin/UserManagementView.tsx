import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Edit,
  Trash2,
  KeyRound,
  Eye,
  EyeOff,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building,
  Mail,
  Lock,
  User as UserIcon,
  Copy,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { User, UserRole } from '../../types/ppap';

const ROLES_LIST: { role: UserRole; label: string; desc: string; color: string }[] = [
  {
    role: 'Administrator',
    label: 'Administrator (ผู้ดูแลระบบสูงสุด)',
    desc: 'สิทธิ์สูงสุด จัดการสมาชิก อนุมัติเอกสาร และตั้งค่าทั้งระบบ',
    color: 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
  },
  {
    role: 'Quality Manager',
    label: 'Quality Manager (ผู้จัดการฝ่ายคุณภาพ)',
    desc: 'อนุมัติเอกสาร PPAP 18 Elements, ตรวจสอบ Audit Trail',
    color: 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
  },
  {
    role: 'Quality Engineer',
    label: 'Quality Engineer (วิศวกรฝ่ายคุณภาพ)',
    desc: 'จัดทำ PFMEA, Control Plan, ตรวจสอบความสมบูรณ์ PPAP',
    color: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
  },
  {
    role: 'Production Engineer',
    label: 'Production Engineer (วิศวกรฝ่ายผลิต)',
    desc: 'จัดทำ Process Flow Diagram, Work Instruction, ควบคุมไลน์ผลิต',
    color: 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
  },
  {
    role: 'R&D Engineer',
    label: 'R&D Engineer (วิศวกรวิจัยและพัฒนา)',
    desc: 'จัดทำแบบวิศวกรรม 2D/3D, DFMEA, การเปลี่ยนแปลง ECN',
    color: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
  },
  {
    role: 'Inspector',
    label: 'Inspector (เจ้าหน้าที่ตรวจสอบคุณภาพ)',
    desc: 'บันทึก Dimensional Results, ค่า Cpk/Ppk, ผลแล็บ',
    color: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
  },
  {
    role: 'Viewer',
    label: 'Viewer (ผู้เข้าชม / ลูกค้า / ซัพพลายเออร์)',
    desc: 'เปิดดูเอกสาร พรีวิว PDF และดาวน์โหลดไฟล์ (อ่านอย่างเดียว)',
    color: 'bg-slate-700/50 text-slate-300 border border-slate-600'
  }
];

export const UserManagementView: React.FC = () => {
  const { allUsers, currentUser, createUser, updateUser, deleteUser, isAdmin } = useAuth();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('Quality Engineer');
  const [formDepartment, setFormDepartment] = useState('Quality Assurance');
  const [formSignature, setFormSignature] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password visibility map
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const handleCopyCredentials = (u: User) => {
    const text = `Username: ${u.username || u.email}\nPassword: ${u.password || 'admin123'}`;
    navigator.clipboard.writeText(text);
    setCopiedId(u.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormName('');
    setFormUsername('');
    setFormPassword('pass1234');
    setFormEmail('');
    setFormRole('Quality Engineer');
    setFormDepartment('Quality Assurance');
    setFormSignature('');
    setFormIsActive(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (u: User) => {
    setEditingUser(u);
    setFormName(u.name);
    setFormUsername(u.username || '');
    setFormPassword(u.password || 'admin123');
    setFormEmail(u.email);
    setFormRole(u.role);
    setFormDepartment(u.department || 'Quality Assurance');
    setFormSignature(u.signature || `${u.name} (${u.role})`);
    setFormIsActive(u.isActive !== false);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formName.trim()) {
      setFormError('กรุณากรอกชื่อ-นามสกุล');
      return;
    }
    if (!formUsername.trim()) {
      setFormError('กรุณากรอกชื่อผู้ใช้ (Username)');
      return;
    }
    if (!formPassword.trim()) {
      setFormError('กรุณากรอกรหัสผ่าน (Password)');
      return;
    }
    if (!formEmail.trim() || !formEmail.includes('@')) {
      setFormError('กรุณากรอกอีเมลให้ถูกต้อง');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingUser) {
        // Update user
        await updateUser(editingUser.id, {
          name: formName.trim(),
          username: formUsername.trim(),
          password: formPassword.trim(),
          email: formEmail.trim(),
          role: formRole,
          department: formDepartment.trim(),
          signature: formSignature.trim() || `${formName} (${formRole})`,
          isActive: formIsActive
        });
        alert(`อัปเดตข้อมูลสมาชิก "${formName}" สำเร็จเรียบร้อยแล้ว`);
      } else {
        // Create new user
        await createUser({
          name: formName.trim(),
          username: formUsername.trim(),
          password: formPassword.trim(),
          email: formEmail.trim(),
          role: formRole,
          department: formDepartment.trim(),
          signature: formSignature.trim() || `${formName} (${formRole})`,
          isActive: formIsActive,
          avatarUrl: `https://images.unsplash.com/photo-${1530000000000 + Math.floor(Math.random() * 99999999)}?w=120&auto=format&fit=crop&q=80`
        });
        alert(`สร้างบัญชีผู้ใช้ใหม่สำหรับ "${formName}" สำเร็จเรียบร้อยแล้ว\nUsername: ${formUsername}\nPassword: ${formPassword}`);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (u: User) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบบัญชีผู้ใช้ "${u.name}" (${u.username || u.email}) ออกจากระบบ?`)) {
      return;
    }

    try {
      await deleteUser(u.id);
      alert(`ลบบัญชีผู้ใช้ "${u.name}" เรียบร้อยแล้ว`);
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการลบผู้ใช้');
    }
  };

  // Filtered Users
  const filteredUsers = allUsers.filter(u => {
    if (filterRole !== 'All' && u.role !== filterRole) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = u.name.toLowerCase().includes(q);
      const matchUsername = (u.username || '').toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchDept = (u.department || '').toLowerCase().includes(q);
      if (!matchName && !matchUsername && !matchEmail && !matchDept) return false;
    }
    return true;
  });

  const adminCount = allUsers.filter(u => u.role === 'Administrator').length;
  const qualityCount = allUsers.filter(u => u.role === 'Quality Manager' || u.role === 'Quality Engineer').length;
  const activeCount = allUsers.filter(u => u.isActive !== false).length;

  return (
    <div className="space-y-6">
      
      {/* 1. Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold text-white tracking-tight">
                  การจัดการสมาชิกและสิทธิ์การใช้งาน (User & Role Management)
                </h1>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                  Admin Only
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                สำหรับผู้ดูแลระบบ: แก้ไขข้อมูลสมาชิก, เปลี่ยนตำแหน่ง/บทบาท, กำหนด Username และรหัสผ่านเข้าใช้งาน
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center space-x-2 shadow-md hover:shadow-blue-600/20"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ เพิ่มสมาชิกใหม่ (Add Member)</span>
            </button>
          </div>
        </div>

        {/* 2. Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800 text-xs">
          <div className="bg-slate-850/60 border border-slate-800 rounded-xl p-3">
            <span className="text-slate-400 text-[11px] block">สมาชิกทั้งหมด</span>
            <span className="text-xl font-black text-white">{allUsers.length}</span>
            <span className="text-[10px] text-slate-500 block">ผู้ใช้งานในระบบ</span>
          </div>

          <div className="bg-slate-850/60 border border-slate-800 rounded-xl p-3">
            <span className="text-slate-400 text-[11px] block">ผู้ดูแลระบบ (Admin)</span>
            <span className="text-xl font-black text-purple-400">{adminCount}</span>
            <span className="text-[10px] text-purple-400/80 block">สิทธิ์ควบคุมสูงสุด</span>
          </div>

          <div className="bg-slate-850/60 border border-slate-800 rounded-xl p-3">
            <span className="text-slate-400 text-[11px] block">ทีมวิศวกรคุณภาพ (QA/QE)</span>
            <span className="text-xl font-black text-blue-400">{qualityCount}</span>
            <span className="text-[10px] text-blue-400/80 block">จัดทำและอนุมัติ PPAP</span>
          </div>

          <div className="bg-slate-850/60 border border-slate-800 rounded-xl p-3">
            <span className="text-slate-400 text-[11px] block">บัญชีพร้อมใช้งาน (Active)</span>
            <span className="text-xl font-black text-emerald-400">{activeCount}</span>
            <span className="text-[10px] text-emerald-400/80 block">สามารถล็อกอินได้</span>
          </div>
        </div>

      </div>

      {/* 3. Search and Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Role Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-slate-400 font-medium">ตำแหน่ง/สิทธิ์:</span>
          <select
            value={filterRole}
            onChange={e => setFilterRole(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500 font-medium"
          >
            <option value="All">ทุกตำแหน่ง ({allUsers.length})</option>
            {ROLES_LIST.map(r => (
              <option key={r.role} value={r.role}>{r.role}</option>
            ))}
          </select>
        </div>

        {/* Search Input */}
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="ค้นหาชื่อ, Username, Email, หรือแผนก..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="text-slate-400 text-xs">
          พบ <strong>{filteredUsers.length}</strong> จาก {allUsers.length} รายชื่อ
        </div>

      </div>

      {/* 4. Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse min-w-[1050px]">
          <thead>
            <tr className="bg-slate-850 text-slate-300 border-b border-slate-800 font-semibold">
              <th className="p-3 w-12 text-center">#</th>
              <th className="p-3 w-64">ชื่อ-นามสกุล / แผนก</th>
              <th className="p-3 w-40">Username (ชื่อผู้ใช้)</th>
              <th className="p-3 w-48">Password (รหัสผ่าน)</th>
              <th className="p-3 w-48">ตำแหน่ง / บทบาทสิทธิ์</th>
              <th className="p-3 w-48">อีเมล</th>
              <th className="p-3 w-28 text-center">สถานะ</th>
              <th className="p-3 w-32 text-center">การจัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-12 text-center text-slate-500">
                  ไม่พบรายชื่อสมาชิกตามเงื่อนไขที่ค้นหา
                </td>
              </tr>
            ) : (
              filteredUsers.map((u, idx) => {
                const roleConfig = ROLES_LIST.find(r => r.role === u.role) || ROLES_LIST[0];
                const isCurrent = u.id === currentUser.id;
                const isPassVisible = !!visiblePasswords[u.id];
                const passText = u.password || 'admin123';

                return (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition">
                    
                    {/* Index */}
                    <td className="p-3 text-center text-slate-500 font-mono text-[11px]">
                      {idx + 1}
                    </td>

                    {/* Name & Avatar */}
                    <td className="p-3">
                      <div className="flex items-center space-x-2.5">
                        <img
                          src={u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
                          alt={u.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-slate-100 flex items-center space-x-1.5">
                            <span className="truncate max-w-[200px]">{u.name}</span>
                            {isCurrent && (
                              <span className="text-[9px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-1 rounded font-normal">
                                ตัวคุณ
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[200px]">
                            {u.department || 'Quality Assurance'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Username */}
                    <td className="p-3">
                      <div className="inline-flex items-center space-x-1.5 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700/80 font-mono text-xs font-bold text-slate-200">
                        <UserIcon className="w-3 h-3 text-blue-400" />
                        <span>{u.username || u.email.split('@')[0]}</span>
                      </div>
                    </td>

                    {/* Password */}
                    <td className="p-3">
                      <div className="flex items-center space-x-1.5">
                        <div className="bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800 font-mono text-xs text-amber-300 font-semibold tracking-wider min-w-[90px]">
                          {isPassVisible ? passText : '••••••••'}
                        </div>
                        <button
                          onClick={() => togglePasswordVisibility(u.id)}
                          className="p-1 text-slate-400 hover:text-slate-200 transition"
                          title={isPassVisible ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                        >
                          {isPassVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleCopyCredentials(u)}
                          className="p-1 text-slate-400 hover:text-blue-400 transition"
                          title="คัดลอก Username และ Password"
                        >
                          {copiedId === u.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="p-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${roleConfig.color}`}>
                        {u.role}
                      </span>
                    </td>

                    {/* Email */}
                    <td className="p-3 text-slate-300 truncate max-w-[180px]">
                      {u.email}
                    </td>

                    {/* Status */}
                    <td className="p-3 text-center">
                      {u.isActive !== false ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <XCircle className="w-3 h-3" />
                          <span>Inactive</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => handleOpenEditModal(u)}
                          className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition"
                          title="แก้ไขข้อมูล, ตำแหน่ง, หรือเปลี่ยนรหัสผ่าน"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {u.id !== currentUser.id && u.id !== 'u-admin-narin' && (
                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                            title="ลบบัญชีผู้ใช้"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 5. Add / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingUser ? `แก้ไขข้อมูลสมาชิก: ${editingUser.name}` : 'เพิ่มสมาชิกใหม่และกำหนดสิทธิ์เข้าใช้'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    กำหนด Username, Password, ตำแหน่งบทบาท (RBAC) และข้อมูลสังกัด
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Error Message */}
            {formError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
              
              {/* Name */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  ชื่อ-นามสกุล (Full Name): <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="เช่น สมชาย ใจดี หรือ Akira Tanaka"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Username & Password */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Username (ชื่อผู้ใช้ล็อกอิน): <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formUsername}
                    onChange={e => setFormUsername(e.target.value)}
                    placeholder="เช่น somchai"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Password (รหัสผ่าน): <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formPassword}
                    onChange={e => setFormPassword(e.target.value)}
                    placeholder="เช่น admin123"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-amber-300 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Email & Department */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    อีเมล (Email): <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={e => setFormEmail(e.target.value)}
                    placeholder="somchai@company.com"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">แผนก (Department):</label>
                  <input
                    type="text"
                    value={formDepartment}
                    onChange={e => setFormDepartment(e.target.value)}
                    placeholder="เช่น Quality Assurance, R&D"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  ตำแหน่ง / สิทธิ์การใช้งาน (Role & Permissions): <span className="text-rose-400">*</span>
                </label>
                <select
                  value={formRole}
                  onChange={e => setFormRole(e.target.value as UserRole)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-semibold focus:outline-none focus:border-blue-500"
                >
                  {ROLES_LIST.map(r => (
                    <option key={r.role} value={r.role}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  {ROLES_LIST.find(r => r.role === formRole)?.desc}
                </p>
              </div>

              {/* Signature */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  ลายเซ็นอิเล็กทรอนิกส์ (Digital Sign-off Stamp):
                </label>
                <input
                  type="text"
                  value={formSignature}
                  onChange={e => setFormSignature(e.target.value)}
                  placeholder="เช่น Somchai P. (QA Mgr)"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Active Toggle */}
              <div className="pt-1">
                <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={e => setFormIsActive(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-blue-500"
                  />
                  <span>เปิดใช้งานบัญชีนี้ (Active - สามารถเข้าสู่ระบบได้)</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition flex items-center space-x-2 shadow-md disabled:opacity-50"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{isSubmitting ? 'กำลังบันทึก...' : editingUser ? 'บันทึกการแก้ไข' : 'สร้างบัญชีผู้ใช้'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
