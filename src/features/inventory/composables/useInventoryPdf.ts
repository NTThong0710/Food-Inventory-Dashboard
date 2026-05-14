import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Ingredient } from '@/features/inventory/store';

// ──────────────────────────────────────────────
// Helper: format VND
// ──────────────────────────────────────────────
function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// ──────────────────────────────────────────────
// Helper: format date string
// ──────────────────────────────────────────────
function fmtDate(dateStr?: string | null): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('vi-VN');
}

// ──────────────────────────────────────────────
// Helper: stock status
// ──────────────────────────────────────────────
function getStockStatus(qty: number): 'high' | 'normal' | 'low' {
  if (qty > 40) return 'high';
  if (qty >= 20) return 'normal';
  return 'low';
}

function getStockLabel(qty: number): string {
  const s = getStockStatus(qty);
  if (s === 'high') return 'Nhiều';
  if (s === 'normal') return 'Vừa';
  return 'Sắp hết';
}

// ──────────────────────────────────────────────
// Helper: expiry status
// ──────────────────────────────────────────────
function getExpiryStatus(dateStr?: string | null): 'expired' | 'soon' | 'ok' | 'none' {
  if (!dateStr) return 'none';
  const days = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
  if (days < 0) return 'expired';
  if (days <= 7) return 'soon';
  return 'ok';
}

// ──────────────────────────────────────────────
// Main export function
// ──────────────────────────────────────────────
export async function exportInventoryPdf(
  items: Ingredient[],
  exportedBy: string = 'Hệ thống'
): Promise<void> {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const now = new Date();

  // ── Brand colors ──
  const GREEN_DARK: [number, number, number] = [26, 46, 22];   // #1A2E16
  const GREEN_ACCENT: [number, number, number] = [55, 236, 19]; // #37EC13
  const GRAY_BG: [number, number, number] = [245, 247, 245];

  // ═══════════════════════════════════════════════
  // PAGE 1 — COVER
  // ═══════════════════════════════════════════════
  // Background
  doc.setFillColor(...GREEN_DARK);
  doc.rect(0, 0, pageW, pageH, 'F');

  // Accent strip
  doc.setFillColor(...GREEN_ACCENT);
  doc.rect(0, pageH - 18, pageW, 18, 'F');

  // Logo / title block
  doc.setFillColor(55, 236, 19, 0.15);
  doc.roundedRect(pageW / 2 - 55, 35, 110, 110, 10, 10, 'F');

  // Report title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('BAO CAO TONG HOP KHO', pageW / 2, 170, { align: 'center' });

  doc.setFontSize(13);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(180, 220, 180);
  doc.text('Inventory Report', pageW / 2, 182, { align: 'center' });

  // Info block
  doc.setFontSize(11);
  doc.setTextColor(200, 230, 200);
  const infoY = 205;
  doc.text(`Ngay lap: ${now.toLocaleDateString('vi-VN')}`, pageW / 2 - 60, infoY);
  doc.text(`Gio: ${now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`, pageW / 2 + 20, infoY);
  doc.text(`Nguoi xuat: ${exportedBy}`, pageW / 2, infoY + 10, { align: 'center' });

  // Footer strip text
  doc.setTextColor(...GREEN_DARK);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('FOOD MANAGEMENT SYSTEM', pageW / 2, pageH - 7, { align: 'center' });

  // ═══════════════════════════════════════════════
  // PAGE 2 — SUMMARY STATS
  // ═══════════════════════════════════════════════
  doc.addPage();

  // Header bar
  doc.setFillColor(...GREEN_DARK);
  doc.rect(0, 0, pageW, 22, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('BAO CAO TONG HOP KHO', 14, 14);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(now.toLocaleDateString('vi-VN'), pageW - 14, 14, { align: 'right' });

  // Section title
  doc.setTextColor(...GREEN_DARK);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Thong ke tong quan', 14, 36);

  // ── Metrics ──
  const totalItems = items.length;
  const totalValue = items.reduce((s, i) => s + i.quantity * i.cost, 0);
  const lowStockCount = items.filter(i => getStockStatus(i.quantity) === 'low').length;
  const expiredCount = items.filter(i => getExpiryStatus(i.expiry_date) === 'expired').length;
  const expiringSoonCount = items.filter(i => getExpiryStatus(i.expiry_date) === 'soon').length;
  const categories = new Set(items.map(i => i.category)).size;

  interface StatCard { label: string; value: string; color: [number, number, number] }
  const cards: StatCard[] = [
    { label: 'Tong nguyen lieu', value: `${totalItems}`, color: [26, 46, 22] },
    { label: 'So danh muc', value: `${categories}`, color: [30, 58, 138] },
    { label: 'Tong gia tri kho', value: formatVND(totalValue), color: [6, 78, 59] },
    { label: 'Sap het hang', value: `${lowStockCount}`, color: [120, 53, 15] },
    { label: 'Het han', value: `${expiredCount}`, color: [127, 29, 29] },
    { label: 'Gan het han (<=7 ngay)', value: `${expiringSoonCount}`, color: [113, 63, 18] },
  ];

  const cardW = (pageW - 28 - 10) / 3;
  const cardH = 28;
  const startX = 14;
  let cardY = 44;

  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 3; col++) {
      const card = cards[row * 3 + col];
      if (!card) continue; // guard against undefined
      const x = startX + col * (cardW + 5);
      const y = cardY + row * (cardH + 5);
      doc.setFillColor(...card.color);
      doc.roundedRect(x, y, cardW, cardH, 3, 3, 'F');
      doc.setTextColor(200, 240, 200);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(card.label, x + 5, y + 9);
      doc.setTextColor(55, 236, 19);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(card.value, x + 5, y + 22);
    }
  }

  // Section: Category breakdown table
  doc.setTextColor(...GREEN_DARK);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Phan bo theo danh muc', 14, cardY + 2 * (cardH + 5) + 12);

  const catMap = new Map<string, { count: number; totalValue: number; lowStock: number }>();
  for (const item of items) {
    const entry = catMap.get(item.category) ?? { count: 0, totalValue: 0, lowStock: 0 };
    entry.count++;
    entry.totalValue += item.quantity * item.cost;
    if (getStockStatus(item.quantity) === 'low') entry.lowStock++;
    catMap.set(item.category, entry);
  }

  const catRows = [...catMap.entries()].map(([cat, val]) => [
    cat,
    `${val.count}`,
    formatVND(val.totalValue),
    val.lowStock > 0 ? `${val.lowStock} sap het` : 'OK',
  ]);

  autoTable(doc, {
    startY: cardY + 2 * (cardH + 5) + 18,
    head: [['Danh muc', 'So luong NL', 'Gia tri', 'Canh bao']],
    body: catRows,
    theme: 'grid',
    headStyles: { fillColor: GREEN_DARK, textColor: [55, 236, 19], fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: [30, 40, 30] },
    alternateRowStyles: { fillColor: GRAY_BG },
    columnStyles: { 3: { halign: 'center' } },
    margin: { left: 14, right: 14 },
    didParseCell(data) {
      if (data.section === 'body' && data.column.index === 3) {
        const v = String(data.cell.raw);
        if (v.includes('het')) {
          data.cell.styles.textColor = [185, 28, 28];
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = [21, 128, 61];
        }
      }
    },
  });

  // ═══════════════════════════════════════════════
  // PAGE 3+ — FULL INGREDIENT TABLE
  // ═══════════════════════════════════════════════
  doc.addPage();

  // Header bar
  doc.setFillColor(...GREEN_DARK);
  doc.rect(0, 0, pageW, 22, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('DANH SACH NGUYEN LIEU CHI TIET', 14, 14);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(now.toLocaleDateString('vi-VN'), pageW - 14, 14, { align: 'right' });

  const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name));

  const tableRows = sorted.map((item, idx) => [
    `${idx + 1}`,
    item.sku,
    item.name,
    item.category,
    `${item.quantity} ${item.unit}`,
    formatVND(item.cost),
    formatVND(item.quantity * item.cost),
    getStockLabel(item.quantity),
    fmtDate(item.production_date),
    fmtDate(item.expiry_date),
  ]);

  autoTable(doc, {
    startY: 28,
    head: [['#', 'SKU', 'Ten NL', 'Danh muc', 'So luong', 'Don gia', 'Gia tri', 'Trang thai', 'NSX', 'HSD']],
    body: tableRows,
    theme: 'striped',
    headStyles: {
      fillColor: GREEN_DARK,
      textColor: [55, 236, 19],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center',
    },
    bodyStyles: { fontSize: 8, textColor: [20, 30, 20] },
    alternateRowStyles: { fillColor: [245, 250, 245] },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 },
      1: { cellWidth: 26, fontStyle: 'bold' },
      2: { cellWidth: 40 },
      3: { cellWidth: 28 },
      4: { halign: 'right', cellWidth: 22 },
      5: { halign: 'right', cellWidth: 28 },
      6: { halign: 'right', cellWidth: 32 },
      7: { halign: 'center', cellWidth: 20 },
      8: { halign: 'center', cellWidth: 22 },
      9: { halign: 'center', cellWidth: 22 },
    },
    margin: { left: 14, right: 14, top: 28 },
    didParseCell(data) {
      if (data.section !== 'body') return;
      const row = sorted[data.row.index];
      if (!row) return;

      // Color "Trang thai" column (index 7)
      if (data.column.index === 7) {
        const status = getStockStatus(row.quantity);
        if (status === 'low') {
          data.cell.styles.textColor = [185, 28, 28];
          data.cell.styles.fontStyle = 'bold';
        } else if (status === 'normal') {
          data.cell.styles.textColor = [146, 64, 14];
        } else {
          data.cell.styles.textColor = [21, 128, 61];
        }
      }

      // Color "HSD" column (index 9)
      if (data.column.index === 9) {
        const exp = getExpiryStatus(row.expiry_date);
        if (exp === 'expired') {
          data.cell.styles.textColor = [185, 28, 28];
          data.cell.styles.fontStyle = 'bold';
        } else if (exp === 'soon') {
          data.cell.styles.textColor = [180, 83, 9];
          data.cell.styles.fontStyle = 'bold';
        }
      }

      // Highlight entire row if expired
      const exp = getExpiryStatus(row.expiry_date);
      if (exp === 'expired') {
        data.cell.styles.fillColor = [254, 226, 226];
      } else if (exp === 'soon') {
        data.cell.styles.fillColor = [255, 247, 237];
      }
    },
    // Footer tổng giá trị
    foot: [[
      '', '', '', '', '',
      'Tong gia tri:',
      formatVND(items.reduce((s, i) => s + i.quantity * i.cost, 0)),
      '', '', '',
    ]],
    footStyles: {
      fillColor: GREEN_DARK,
      textColor: [55, 236, 19],
      fontStyle: 'bold',
      fontSize: 9,
    },
    showFoot: 'lastPage',
  });

  // ── Page numbers on all pages ──
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Trang ${i} / ${totalPages}`,
      pageW / 2,
      pageH - 6,
      { align: 'center' }
    );
  }

  // ── Save ──
  const filename = `BaoCaoKho_${now.toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
