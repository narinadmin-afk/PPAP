import React, { createContext, useContext, useState } from 'react';
import { SupportedLanguage } from '../types/ppap';
import { translations, Translations } from '../i18n/translations';

type CallableTranslations = Translations & {
  (key: string): string;
  [key: string]: any;
};

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: CallableTranslations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const saved = localStorage.getItem('ppap_lang') as SupportedLanguage;
      return saved === 'en' || saved === 'zh' || saved === 'th' ? saved : 'th';
    } catch {
      return 'th';
    }
  });

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('ppap_lang', lang);
    } catch {}
  };

  const baseTranslations = translations[language] || translations.th || translations.en;

  // Make t both an object with fields and callable as a function
  const t: CallableTranslations = ((key: string) => {
    if (key && (baseTranslations as any)[key]) {
      return (baseTranslations as any)[key];
    }
    // Fallback dictionary for arbitrary keys used in user edits
    const extraLabels: Record<string, string> = {
      'app.title': 'PPAP Management System',
      'app.subtitle': 'ระบบบริหารจัดการเอกสาร PPAP และไฟล์โปรเจกต์ยานยนต์',
      'view_edit_element': 'เปิดดูและแก้ไขเอกสาร Element นี้',
      'open_dedicated_editor': 'เปิดหน้าจอแก้ไขเฉพาะทาง',
      'view_edit_document_table': 'เปิดดูและแก้ไขตารางข้อมูลมาตรฐาน',
      'pdf_preview': 'พรีวิวเอกสารเป็น PDF เต็มรูปแบบ',
      'upload_attachment': 'อัปโหลดไฟล์แนบ',
      'download_document': 'ดาวน์โหลดเอกสาร',
      'electronic_review_approval': 'ตรวจสอบและอนุมัติทางอิเล็กทรอนิกส์',
      'enter_rejection_comment': 'ระบุข้อเสนอแนะหรือเหตุผลการปฏิเสธเอกสาร...',
      'reject_with_comment': 'ปฏิเสธพร้อมบันทึกคอมเมนต์',
      'approve_element': 'อนุมัติเอกสาร (Approve)',
      'attach_and_submit': 'แนบไฟล์และส่งตรวจทาน'
    };
    return extraLabels[key] || key;
  }) as any;

  Object.assign(t, baseTranslations);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};