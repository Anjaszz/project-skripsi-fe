import { jsPDF } from 'jspdf';

/**
 * Format currency helper
 */
const formatRp = (num) => {
  return 'Rp ' + Number(num || 0).toLocaleString('id-ID');
};

/**
 * Format date & time helper: DD/MM/YYYY HH:mm:ss
 */
const formatDateFull = (dateString) => {
  const d = dateString ? new Date(dateString) : new Date();
  const dateStr = d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const timeStr = d.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  return `${dateStr} ${timeStr}`;
};

/**
 * Print Supermarket Receipt via Browser Print (Thermal POS 58mm/80mm compatible)
 */
export const printThermalReceipt = (transaction, options = {}) => {
  if (!transaction) return;

  const storeName = options.storeName || 'PD. AMANAH LINTANG';
  const storeSub = options.storeSub || 'Distributor & Grosir Air Mineral';
  const storeAddress = options.storeAddress || 'Jl. Desa Ciasem Tengah, Ciasem, Subang';
  const storePhone = options.storePhone || '0813-2040-2004';

  const trxNumber = transaction.transactionNumber || 'TRX-DEFAULT';
  const cashierName = transaction.cashierName || options.cashierName || 'Kasir';
  const dateStr = formatDateFull(transaction.createdAt);
  const paymentMethod = transaction.paymentMethod || 'TUNAI';

  const total = transaction.total || 0;
  const cashPaid = typeof transaction.cashPaid === 'number' && transaction.cashPaid > 0 
    ? transaction.cashPaid 
    : (options.cashPaid || total);
  const change = typeof transaction.change === 'number' 
    ? transaction.change 
    : (options.change >= 0 ? options.change : (cashPaid - total));

  const items = transaction.items || [];
  const totalQty = items.reduce((sum, item) => sum + (item.quantity || 0), 0);

  const itemsHTML = items.map(item => {
    const itemName = `${item.productName}${item.variantName ? ' (' + item.variantName + ')' : ''}`;
    const qty = item.quantity || 1;
    const price = item.sellingPrice || 0;
    const subtotal = item.subtotal || (qty * price);

    return `
      <tr>
        <td colspan="2" style="font-weight: bold; padding-top: 4px;">${itemName}</td>
      </tr>
      <tr>
        <td style="padding-left: 8px; color: #333;">${qty} x ${formatRp(price)}</td>
        <td style="text-align: right; font-weight: bold; vertical-align: bottom;">${formatRp(subtotal)}</td>
      </tr>
    `;
  }).join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Struk Belanja - ${trxNumber}</title>
      <style>
        @page {
          size: 80mm auto;
          margin: 0;
        }
        body {
          font-family: 'Courier New', Courier, monospace;
          width: 78mm;
          margin: 0 auto;
          padding: 8px;
          background: #fff;
          color: #000;
          font-size: 11px;
          line-height: 1.3;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .bold { font-weight: bold; }
        .header {
          margin-bottom: 8px;
          padding-bottom: 6px;
          border-bottom: 1px dashed #000;
        }
        .store-title {
          font-size: 14px;
          font-weight: 900;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .store-sub {
          font-size: 9px;
          margin-top: 2px;
        }
        .store-contact {
          font-size: 9px;
          margin-top: 2px;
        }
        .meta-table, .items-table, .total-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 6px;
        }
        .meta-table td {
          font-size: 10px;
          padding: 1px 0;
        }
        .dashed-line {
          border-top: 1px dashed #000;
          margin: 6px 0;
        }
        .double-line {
          border-top: 2px double #000;
          margin: 6px 0;
        }
        .items-table td {
          font-size: 10px;
          padding: 1px 0;
        }
        .total-table td {
          font-size: 11px;
          padding: 2px 0;
        }
        .total-row {
          font-size: 13px;
          font-weight: bold;
        }
        .footer {
          margin-top: 10px;
          padding-top: 6px;
          border-top: 1px dashed #000;
          font-size: 9px;
        }
        @media print {
          body {
            width: 100%;
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="header text-center">
        <div class="store-title">${storeName}</div>
        <div class="store-sub">${storeSub}</div>
        <div class="store-contact">${storeAddress}</div>
        <div class="store-contact">Telp: ${storePhone}</div>
      </div>

      <table class="meta-table">
        <tr>
          <td>No. Struk</td>
          <td>: <span class="bold">${trxNumber}</span></td>
        </tr>
        <tr>
          <td>Waktu</td>
          <td>: ${dateStr}</td>
        </tr>
        <tr>
          <td>Kasir</td>
          <td>: ${cashierName}</td>
        </tr>
        <tr>
          <td>Metode</td>
          <td>: ${paymentMethod}</td>
        </tr>
      </table>

      <div class="dashed-line"></div>

      <table class="items-table">
        ${itemsHTML}
      </table>

      <div class="dashed-line"></div>

      <table class="total-table">
        <tr>
          <td>Total Item</td>
          <td class="text-right bold">${totalQty} Pcs</td>
        </tr>
        <tr class="total-row">
          <td>TOTAL BELANJA</td>
          <td class="text-right">${formatRp(total)}</td>
        </tr>
        <tr>
          <td>TUNAI / BAYAR</td>
          <td class="text-right">${formatRp(cashPaid)}</td>
        </tr>
        <tr>
          <td>KEMBALIAN</td>
          <td class="text-right bold">${formatRp(change)}</td>
        </tr>
      </table>

      <div class="double-line"></div>

      <div class="footer text-center">
        <p class="bold" style="margin: 2px 0;">*** TERIMA KASIH ***</p>
        <p style="margin: 2px 0;">Barang yang sudah dibeli</p>
        <p style="margin: 2px 0;">tidak dapat ditukar/dikembalikan.</p>
        <p style="margin: 4px 0 0 0; font-size: 8px; color: #555;">Struk ini merupakan bukti pembayaran sah.</p>
      </div>

      <script>
        window.onload = function() {
          window.focus();
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  // Create temporary printing window
  const printWindow = window.open('', '_blank', 'width=450,height=600');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
};

/**
 * Download Supermarket Receipt as thermal-style PDF
 */
export const downloadReceiptPDF = (transaction, options = {}) => {
  if (!transaction) return;

  const storeName = options.storeName || 'PD. AMANAH LINTANG';
  const storeSub = options.storeSub || 'Distributor & Grosir Air Mineral';
  const storeAddress = options.storeAddress || 'Jl. Desa Ciasem Tengah, Subang';
  const storePhone = options.storePhone || '0813-2040-2004';

  const trxNumber = transaction.transactionNumber || 'TRX-DEFAULT';
  const cashierName = transaction.cashierName || options.cashierName || 'Kasir';
  const dateStr = formatDateFull(transaction.createdAt);
  const paymentMethod = transaction.paymentMethod || 'TUNAI';

  const total = transaction.total || 0;
  const cashPaid = typeof transaction.cashPaid === 'number' && transaction.cashPaid > 0 
    ? transaction.cashPaid 
    : (options.cashPaid || total);
  const change = typeof transaction.change === 'number' 
    ? transaction.change 
    : (options.change >= 0 ? options.change : (cashPaid - total));

  const items = transaction.items || [];
  const totalQty = items.reduce((sum, item) => sum + (item.quantity || 0), 0);

  // Dynamic height calculation based on item count
  const baseHeight = 130;
  const itemHeight = items.length * 12;
  const pageHeight = Math.max(160, baseHeight + itemHeight);

  // 80mm POS Paper width = 80mm
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, pageHeight]
  });

  doc.setFont('courier', 'bold');
  
  let y = 10;

  // Store Header
  doc.setFontSize(11);
  doc.text(storeName, 40, y, { align: 'center' });
  
  doc.setFont('courier', 'normal');
  doc.setFontSize(7.5);
  y += 4;
  doc.text(storeSub, 40, y, { align: 'center' });
  y += 3.5;
  doc.text(storeAddress, 40, y, { align: 'center' });
  y += 3.5;
  doc.text(`Telp: ${storePhone}`, 40, y, { align: 'center' });

  y += 4;
  doc.text('------------------------------------------------', 40, y, { align: 'center' });

  // Metadata
  y += 4;
  doc.setFontSize(7);
  doc.text(`No. Struk : ${trxNumber}`, 5, y);
  y += 3.5;
  doc.text(`Waktu     : ${dateStr}`, 5, y);
  y += 3.5;
  doc.text(`Kasir     : ${cashierName}`, 5, y);
  y += 3.5;
  doc.text(`Metode    : ${paymentMethod}`, 5, y);

  y += 4;
  doc.text('------------------------------------------------', 40, y, { align: 'center' });

  // Items
  doc.setFontSize(7);
  items.forEach(item => {
    const itemName = `${item.productName}${item.variantName ? ' (' + item.variantName + ')' : ''}`;
    const qty = item.quantity || 1;
    const price = item.sellingPrice || 0;
    const subtotal = item.subtotal || (qty * price);

    y += 4;
    doc.setFont('courier', 'bold');
    doc.text(itemName.substring(0, 36), 5, y);
    
    y += 3.5;
    doc.setFont('courier', 'normal');
    doc.text(` ${qty} x ${formatRp(price)}`, 5, y);
    doc.setFont('courier', 'bold');
    doc.text(formatRp(subtotal), 75, y, { align: 'right' });
  });

  y += 4;
  doc.setFont('courier', 'normal');
  doc.text('------------------------------------------------', 40, y, { align: 'center' });

  // Financial Summary
  y += 4;
  doc.text('Total Item', 5, y);
  doc.text(`${totalQty} Pcs`, 75, y, { align: 'right' });

  y += 4;
  doc.setFont('courier', 'bold');
  doc.setFontSize(8.5);
  doc.text('TOTAL BELANJA', 5, y);
  doc.text(formatRp(total), 75, y, { align: 'right' });

  y += 4;
  doc.setFont('courier', 'normal');
  doc.setFontSize(7.5);
  doc.text('TUNAI / BAYAR', 5, y);
  doc.text(formatRp(cashPaid), 75, y, { align: 'right' });

  y += 3.5;
  doc.setFont('courier', 'bold');
  doc.text('KEMBALIAN', 5, y);
  doc.text(formatRp(change), 75, y, { align: 'right' });

  y += 4;
  doc.setFont('courier', 'normal');
  doc.text('================================================', 40, y, { align: 'center' });

  // Footer
  y += 4;
  doc.setFont('courier', 'bold');
  doc.setFontSize(8);
  doc.text('*** TERIMA KASIH ***', 40, y, { align: 'center' });

  y += 3.5;
  doc.setFont('courier', 'normal');
  doc.setFontSize(6.5);
  doc.text('Barang yang sudah dibeli', 40, y, { align: 'center' });
  y += 3;
  doc.text('tidak dapat ditukar/dikembalikan', 40, y, { align: 'center' });
  y += 3;
  doc.text('Simpan struk ini sebagai bukti pembayaran sah.', 40, y, { align: 'center' });

  doc.save(`Struk_${trxNumber}.pdf`);
};
