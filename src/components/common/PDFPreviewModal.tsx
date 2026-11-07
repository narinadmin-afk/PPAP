import React, { useState } from 'react';
import {
  X,
  Download,
  Printer,
  ExternalLink,
  Maximize2,
  Minimize2,
  FileText,
  CheckCircle2
} from 'lucide-react';

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  pdfBlobUrl: string | null;
  fileName?: string;
  onDownload?: () => void;
}

export const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  pdfBlobUrl,
  fileName = 'document.pdf',
  onDownload
}) => {
  const [isMaximized, setIsMaximized] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
      return;
    }
    if (pdfBlobUrl) {
      const a = document.createElement('a');
      a.href = pdfBlobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleOpenNewTab = () => {
    if (pdfBlobUrl) {
      window.open(pdfBlobUrl, '_blank');
    }
  };

  const handlePrint = () => {
    if (pdfBlobUrl) {
      const iframe = document.getElementById('pdf-preview-iframe') as HTMLIFrameElement;
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.print();
      } else {
        window.open(pdfBlobUrl, '_blank');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div
        className={`bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col transition-all duration-200 overflow-hidden ${
          isMaximized ? 'w-full h-full rounded-none' : 'w-full max-w-6xl h-[92vh]'
        }`}
      >
        {/* Top Header Bar */}
        <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                  {title}
                </h2>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-semibold hidden sm:inline">
                  PDF 100% Ready
                </span>
              </div>
              {subtitle && (
                <p className="text-xs text-slate-400 truncate mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handlePrint}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition flex items-center space-x-1.5"
              title="Print Document (พิมพ์เอกสาร)"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              <span className="hidden md:inline">Print</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition flex items-center space-x-1.5"
              title="Download PDF File (ดาวน์โหลดไฟล์ PDF)"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download PDF</span>
            </button>

            <button
              onClick={handleOpenNewTab}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
              title="Open in New Tab (เปิดในหน้าต่างใหม่)"
            >
              <ExternalLink className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition hidden sm:inline-flex"
              title={isMaximized ? 'Restore View (ย่อหน้าต่าง)' : 'Maximize View (ขยายเต็มหน้าจอ)'}
            >
              {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Close Preview (ปิดหน้าต่างพรีวิว)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Iframe Viewer Body */}
        <div className="flex-1 bg-slate-950 p-2 sm:p-4 min-h-0 relative">
          {pdfBlobUrl ? (
            <iframe
              id="pdf-preview-iframe"
              src={`${pdfBlobUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
              title={title}
              className="w-full h-full rounded-xl border border-slate-800 bg-white shadow-inner"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center space-y-3 text-slate-400">
              <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs">กำลังสร้างไฟล์ PDF และเตรียมการแสดงผลพรีวิว...</p>
            </div>
          )}
        </div>

        {/* Bottom Status Footnote */}
        <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>AIAG PPAP 4th Edition Compliant Export</span>
          </div>
          <span className="font-mono text-[10px] text-slate-500">{fileName}</span>
        </div>

      </div>
    </div>
  );
};
