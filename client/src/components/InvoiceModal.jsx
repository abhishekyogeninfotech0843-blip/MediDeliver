import React, { useRef } from "react";
import {
  X,
  Printer,
  Download,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  User,
  Pill,
  QrCode
} from "lucide-react";
import "./InvoiceModal.css";

// Helper to convert number to English Words
const numberToWords = (num) => {
  const n = Math.floor(Number(num) || 0);
  if (n === 0) return "Zero Rupees Only";

  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const inWords = (num) => {
    if ((num = num.toString()).length > 9) return "Overflow";
    const n = ("000000000" + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return "";
    let str = "";
    str += Number(n[1]) !== 0 ? (a[Number(n[1])] || b[n[1][0]] + " " + a[n[1][1]]) + " Crore " : "";
    str += Number(n[2]) !== 0 ? (a[Number(n[2])] || b[n[2][0]] + " " + a[n[2][1]]) + " Lakh " : "";
    str += Number(n[3]) !== 0 ? (a[Number(n[3])] || b[n[3][0]] + " " + a[n[3][1]]) + " Thousand " : "";
    str += Number(n[4]) !== 0 ? (a[Number(n[4])] || b[n[4][0]] + " " + a[n[4][1]]) + " Hundred " : "";
    str += Number(n[5]) !== 0 ? ((str !== "" ? "and " : "") + (a[Number(n[5])] || b[n[5][0]] + " " + a[n[5][1]])) : "";
    return str.trim();
  };

  return `${inWords(n)} Rupees Only`;
};

const InvoiceModal = ({ order, user, onClose }) => {
  const invoiceRef = useRef(null);

  if (!order) return null;

  const orderIdShort = (order._id || "").slice(-6).toUpperCase();
  const invoiceNumber = `INV-MD-${new Date(order.createdAt || Date.now()).getFullYear()}-${orderIdShort}`;
  const formattedDate = new Date(order.createdAt || Date.now()).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const formattedTime = new Date(order.createdAt || Date.now()).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const customerName = order.customerName || order.customer?.name || user?.name || "Customer";
  const customerEmail = order.customerEmail || order.customer?.email || user?.email || "customer@example.com";
  const customerPhone = order.customerPhone || order.customer?.phone || user?.phone || "+91 98765 43210";
  const deliveryAddress = order.deliveryAddress || "Standard Delivery Address on File";

  const items = order.items || [];
  const subtotal = items.reduce((acc, it) => {
    const price = Number(it.price || it.medicine?.sellingPrice || 0);
    const qty = Number(it.quantity || 1);
    return acc + price * qty;
  }, 0);

  const totalAmount = Number(order.totalAmount || subtotal || 0);
  const deliveryFee = 0.0; // Free express delivery
  const taxRate = 0.05; // 5% GST included
  const taxAmount = (totalAmount * 0.05) / 1.05;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadOfflineHTML = () => {
    if (!invoiceRef.current) return;
    const invoiceContent = invoiceRef.current.innerHTML;
    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Invoice - ${invoiceNumber}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color: #1e293b; background: #fff; }
          .invoice-paper-sheet { max-width: 800px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 32px; border-radius: 12px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #f8fafc; text-align: left; padding: 10px 12px; border-bottom: 2px solid #cbd5e1; font-size: 13px; }
          td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
          .inv-brand-name { font-size: 24px; font-weight: 800; color: #0f766e; }
          .text-right { text-align: right; }
          .inv-total-row { font-size: 16px; font-weight: bold; background: #f0fdfa; }
          @media print {
            body { padding: 0; }
            .invoice-paper-sheet { border: none; padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-paper-sheet">
          ${invoiceContent}
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([fullHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `MediDeliver_${invoiceNumber}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="invoice-modal-backdrop" onClick={onClose}>
      <div
        className="invoice-modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* MODAL CONTROL HEADER (NOT PRINTED) */}
        <div className="invoice-modal-topbar hide-on-print">
          <div className="topbar-title-wrap">
            <div className="invoice-icon-badge">
              <FileText className="top-inv-ic" />
            </div>
            <div>
              <h3>Official Tax Invoice Preview</h3>
              <p>Review your pharmacy bill before printing or saving to device</p>
            </div>
          </div>

          <div className="topbar-actions">
            <button
              type="button"
              className="inv-action-btn btn-print"
              onClick={handlePrint}
              title="Print or Save as PDF"
            >
              <Printer className="btn-ic" />
              <span>Print / Save PDF</span>
            </button>

            <button
              type="button"
              className="inv-action-btn btn-download"
              onClick={handleDownloadOfflineHTML}
              title="Download HTML Document"
            >
              <Download className="btn-ic" />
              <span>Download File</span>
            </button>

            <button
              type="button"
              className="inv-close-btn"
              onClick={onClose}
              title="Close Preview"
            >
              <X />
            </button>
          </div>
        </div>

        {/* PRINTABLE INVOICE SHEET */}
        <div className="invoice-sheet-scrollable">
          <div className="invoice-paper-sheet" ref={invoiceRef}>
            {/* HEADER SECTION */}
            <div className="inv-header">
              <div className="inv-brand-info">
                <div className="inv-brand-row">
                  <div className="inv-logo-box">
                    <Pill className="inv-logo-pill" />
                  </div>
                  <span className="inv-brand-name">
                    Medi<span>Deliver</span>
                  </span>
                </div>
                <p className="inv-tagline">Licensed Healthcare & Prescription Express Pharmacy</p>
                <div className="inv-company-meta">
                  <p><strong>MediDeliver Healthcare Pvt. Ltd.</strong></p>
                  <p>Central Medical Hub, GT Road, Aligarh, UP - 202001</p>
                  <p><strong>GSTIN:</strong> 07AABCM8920C1ZP • <strong>DL No:</strong> DL-20B/21B-UP-81920</p>
                  <p><strong>Email:</strong> support@medideliver.com • <strong>Helpline:</strong> +91 1800 202 8899</p>
                </div>
              </div>

              <div className="inv-doc-meta">
                <div className="inv-badge-title">TAX INVOICE / BILL OF SUPPLY</div>
                <div className="inv-meta-table">
                  <div className="inv-meta-row">
                    <span>Invoice No:</span>
                    <strong>{invoiceNumber}</strong>
                  </div>
                  <div className="inv-meta-row">
                    <span>Invoice Date:</span>
                    <strong>{formattedDate}</strong>
                  </div>
                  <div className="inv-meta-row">
                    <span>Time:</span>
                    <strong>{formattedTime}</strong>
                  </div>
                  <div className="inv-meta-row">
                    <span>Order Reference:</span>
                    <strong>#{orderIdShort}</strong>
                  </div>
                  <div className="inv-meta-row">
                    <span>Tracking ID:</span>
                    <strong>{order.trackingId || `TRK-${orderIdShort}`}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="inv-divider-line" />

            {/* BILL TO & ORDER META ROW */}
            <div className="inv-parties-grid">
              <div className="inv-party-card">
                <h4><User className="card-mini-ic" /> Billed & Delivered To:</h4>
                <div className="party-details">
                  <strong className="party-name">{customerName}</strong>
                  <p className="party-contact">
                    <Phone className="sm-ic" /> {customerPhone}
                  </p>
                  <p className="party-contact">
                    <Mail className="sm-ic" /> {customerEmail}
                  </p>
                  <p className="party-address">
                    <MapPin className="sm-ic" /> {deliveryAddress}
                  </p>
                </div>
              </div>

              <div className="inv-party-card">
                <h4><CreditCard className="card-mini-ic" /> Payment & Fulfillment Details:</h4>
                <div className="party-details">
                  <div className="inv-detail-item">
                    <span>Payment Mode:</span>
                    <strong>{order.paymentMethod === "ONLINE" ? "Razorpay Online (Prepaid)" : "Cash on Delivery (COD)"}</strong>
                  </div>
                  <div className="inv-detail-item">
                    <span>Payment Status:</span>
                    <strong className={`inv-pay-pill ${order.paymentStatus?.toLowerCase()}`}>
                      {order.paymentStatus === "PAID" ? "✓ PAID IN FULL" : "PENDING (COD)"}
                    </strong>
                  </div>
                  <div className="inv-detail-item">
                    <span>Order Fulfillment:</span>
                    <strong className="text-teal">{order.orderStatus?.replace(/_/g, " ") || "ORDER RECEIVED"}</strong>
                  </div>
                  <div className="inv-detail-item">
                    <span>Dispensed By:</span>
                    <span>Registered Pharmacist (Reg. #DL-8821)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* MEDICINES ITEM TABLE */}
            <div className="inv-table-wrapper">
              <table className="inv-items-table">
                <thead>
                  <tr>
                    <th style={{ width: "45px" }}>#</th>
                    <th>Medicine Description & Dosage</th>
                    <th style={{ width: "90px" }}>HSN Code</th>
                    <th style={{ width: "90px" }}>Batch No</th>
                    <th style={{ width: "70px", textAlign: "center" }}>Qty</th>
                    <th style={{ width: "100px", textAlign: "right" }}>Unit Price</th>
                    <th style={{ width: "110px", textAlign: "right" }}>Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => {
                    const price = Number(item.price || item.medicine?.sellingPrice || 0);
                    const qty = Number(item.quantity || 1);
                    const itemTotal = price * qty;
                    const medName = item.medicine?.name || item.name || "Prescription Medicine";
                    const batchNo = `MD-${orderIdShort}-${index + 101}`;

                    return (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>
                          <strong>{medName}</strong>
                          {item.medicine?.category && (
                            <small className="inv-med-category"> ({item.medicine.category})</small>
                          )}
                        </td>
                        <td>300490</td>
                        <td>{batchNo}</td>
                        <td style={{ textAlign: "center" }}>{qty}</td>
                        <td style={{ textAlign: "right" }}>₹{price.toFixed(2)}</td>
                        <td style={{ textAlign: "right" }}><strong>₹{itemTotal.toFixed(2)}</strong></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* FINANCIAL SUMMARY TOTALS */}
            <div className="inv-summary-grid">
              <div className="inv-words-box">
                <small className="summary-label">Amount in Words:</small>
                <p className="words-text">{numberToWords(totalAmount)}</p>

                <div className="inv-compliance-badge">
                  <ShieldCheck className="comp-ic" />
                  <div>
                    <strong>100% Genuine Pharmacy Dispensation</strong>
                    <p>Temperature regulated delivery compliant with D&C Act 1940</p>
                  </div>
                </div>
              </div>

              <div className="inv-calculation-box">
                <div className="inv-calc-row">
                  <span>Items Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="inv-calc-row">
                  <span>Applicable GST (CGST 2.5% + SGST 2.5%):</span>
                  <span>₹{taxAmount.toFixed(2)}</span>
                </div>
                <div className="inv-calc-row">
                  <span>Express Pharmacy Delivery:</span>
                  <span className="text-emerald">FREE</span>
                </div>
                <div className="inv-divider-calc" />
                <div className="inv-total-final-row">
                  <span>Total Amount (INR):</span>
                  <strong>₹{totalAmount.toFixed(2)}</strong>
                </div>
              </div>
            </div>

            {/* INVOICE FOOTER: TERMS, QR & SIGNATURE */}
            <div className="inv-footer">
              <div className="inv-terms-col">
                <h5>Terms & Conditions:</h5>
                <ol>
                  <li>Medicines dispensed against valid prescriptions and authenticated batch numbers.</li>
                  <li>Storage Condition: Store in a cool, dry place protected from direct sunlight.</li>
                  <li>Eligible returns accepted within 7 days in original tamper-evident blister seal.</li>
                  <li>For medical emergency or inquiries, contact MediDeliver 24x7 Support.</li>
                </ol>
              </div>

              <div className="inv-signature-col">
                <div className="qr-badge-box">
                  <QrCode className="qr-svg-mock" />
                  <span>Verify Bill Online</span>
                </div>

                <div className="signature-box">
                  <div className="digital-stamp">
                    <span>MEDIDELIVER PHARMACY</span>
                    <small>✓ DIGITALLY VERIFIED</small>
                  </div>
                  <p className="sign-label">Authorized Signatory & Pharmacist</p>
                  <small>Reg. No. UP-849201-PH</small>
                </div>
              </div>
            </div>

            <div className="inv-bottom-note">
              <p>This is a computer-generated tax invoice and does not require physical signature under Indian IT Act 2000.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
