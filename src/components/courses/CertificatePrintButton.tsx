"use client";

import { Printer } from "lucide-react";

/**
 * 結業證書「列印 / 儲存 PDF」按鈕。
 * 搭配證書頁的 @media print 樣式，列印時只保留證書卡。
 */
export function CertificatePrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print inline-flex items-center gap-2 px-5 py-2.5 bg-nail-gold text-white rounded-xl font-medium hover:bg-nail-gold/90 transition-colors"
    >
      <Printer size={16} />
      列印 / 儲存 PDF
    </button>
  );
}
