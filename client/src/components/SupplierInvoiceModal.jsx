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
  Building2,
  Phone,
  Mail,
  MapPin,
  Pill,
  Truck,
  AlertTriangle,
  Receipt,
  RotateCcw,
} from "lucide-react";
import "./SupplierInvoiceModal.css";

// Helper to convert number to English Words in Indian format
const numberToWords = (num) => {
  const n = Math.floor(Number(num) || 0);
  if (n === 0) return "Zero Rupees Only";

  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen",
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

const SupplierInvoiceModal = ({ supply, onClose, onPayDue }) => {
  const printRef = useRef(null);

  if (!supply) return null;

  const supplier = supply.supplier || {};
  const medicines = supply.medicines || [];

  const invoiceNumber = supply.invoiceNumber || `INV-${(supply._id || "").slice(-6).toUpperCase()}`;
  const formattedDate = new Date(supply.purchaseDate || supply.createdAt || Date.now()).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const subtotal = Number(supply.totalAmount || 0);
  const taxAmount = Number(supply.taxAmount || 0);
  const discountAmount = Number(supply.discountAmount || 0);
  const grandTotal = Number(supply.grandTotal || (subtotal + taxAmount - discountAmount) || 0);
  const paidAmount = Number(supply.paidAmount || 0);
  const dueAmount = Number(supply.dueAmount || Math.max(0, grandTotal - paidAmount) || 0);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadHTML = () => {
    if (!printRef.current) return;
    const content = printRef.current.innerHTML;
    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Supplier Bill - ${invoiceNumber}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color: #1e293b; background: #fff; }
          .sup-invoice-paper { max-width: 800px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 32px; border-radius: 12px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #0f766e; color: #fff; text-align: left; padding: 10px 12px; font-size: 13px; }
          td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
          .sup-brand-name { font-size: 24px; font-weight: 800; color: #0f766e; }
        </style>
      </head>
      <body>
        <div class="sup-invoice-paper">
          ${content}
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([fullHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `MediDeliver-Supplier-Bill-${invoiceNumber}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="sup-invoice-overlay">
      <div className="sup-invoice-container">
        {/* TOP ACTION TOOLBAR */}
        <div className="sup-invoice-toolbar">
          <div className="sup-toolbar-title">
            <Receipt size={20} className="text-teal" />
            <span>Supplier Purchase Bill & Stock Inward Invoice</span>
          </div>

          <div className="sup-toolbar-actions">
            {dueAmount > 0 && onPayDue && (
              <button
                type="button"
                className="sup-tool-btn"
                style={{ background: "#ecfdf5", color: "#047857", borderColor: "#6ee7b7", fontWeight: 700 }}
                onClick={() => {
                  onClose();
                  onPayDue(supply);
                }}
              >
                <CreditCard size={15} />
                <span>Pay Remaining Baki (₹{dueAmount.toFixed(2)})</span>
              </button>
            )}

            <button type="button" className="sup-tool-btn primary" onClick={handlePrint}>
              <Printer size={15} />
              <span>Print Bill</span>
            </button>

            <button type="button" className="sup-tool-btn" onClick={handleDownloadHTML}>
              <Download size={15} />
              <span>Download</span>
            </button>

            <button type="button" className="sup-close-btn" onClick={onClose} title="Close">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* SCROLLABLE SHEET CONTAINER */}
        <div className="sup-invoice-scroll-body">
          <div className="sup-invoice-paper" ref={printRef}>
            {/* BILL HEADER */}
            <div className="sup-bill-header">
              <div>
                <h1 className="sup-brand-name">
                  <Pill size={24} /> MediDeliver Central Pharmacy
                </h1>
                <p className="sup-pharmacy-sub">
                  <strong>Licensed Wholesale & Retail Pharmacy</strong><br />
                  Centre Point, GT Road, Aligarh, Uttar Pradesh - 202001<br />
                  📞 +91 98765 43210 | ✉️ admin@medideliver.com<br />
                  <strong>GSTIN:</strong> 09AABCM1009K1ZT | <strong>Drug Lic #:</strong> DL-UP-2026-9901
                </p>
              </div>

              <div className="sup-bill-title-box">
                <h2 className="sup-bill-badge-title">INWARD TAX INVOICE</h2>
                <span className="sup-inv-num">Bill #{invoiceNumber}</span>
                <span className="sup-inv-date">Date: {formattedDate}</span>
                <div style={{ marginTop: "6px" }}>
                  {supply.paymentStatus === "PAID" ? (
                    <span
                      style={{
                        display: "inline-block",
                        padding: "3px 10px",
                        background: "#dcfce7",
                        color: "#15803d",
                        borderRadius: "9999px",
                        fontSize: "0.75rem",
                        fontWeight: 800,
                      }}
                    >
                      ✅ FULLY PAID
                    </span>
                  ) : supply.paymentStatus === "PARTIAL" ? (
                    <span
                      style={{
                        display: "inline-block",
                        padding: "3px 10px",
                        background: "#fef3c7",
                        color: "#b45309",
                        borderRadius: "9999px",
                        fontSize: "0.75rem",
                        fontWeight: 800,
                      }}
                    >
                      ⚠️ PARTIALLY PAID (DUES PENDING)
                    </span>
                  ) : (
                    <span
                      style={{
                        display: "inline-block",
                        padding: "3px 10px",
                        background: "#fee2e2",
                        color: "#b91c1c",
                        borderRadius: "9999px",
                        fontSize: "0.75rem",
                        fontWeight: 800,
                      }}
                    >
                      🛑 UNPAID / FULL DUE
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* PARTIES INFO: SUPPLIED BY & RECEIVED AT */}
            <div className="sup-parties-grid">
              <div className="sup-party-box">
                <h5>Supplied By (Vendor / Company):</h5>
                <strong>{supply.supplierName || supplier.name || "Pharma Supplier"}</strong>
                <p>
                  <strong>Company:</strong> {supply.companyName || supplier.companyName || "Pharmaceutical Manufacturer"}
                </p>
                {supplier.contactPerson && <p><strong>Contact:</strong> {supplier.contactPerson}</p>}
                {supplier.phone && <p><strong>Phone:</strong> {supplier.phone}</p>}
                {supplier.email && <p><strong>Email:</strong> {supplier.email}</p>}
                {supplier.address && <p><strong>Address:</strong> {supplier.address}</p>}
                {supplier.gstNumber && <p><strong>GSTIN:</strong> {supplier.gstNumber}</p>}
                {supplier.drugLicenseNumber && <p><strong>Drug Lic:</strong> {supplier.drugLicenseNumber}</p>}
              </div>

              <div className="sup-party-box">
                <h5>Received & Billed To:</h5>
                <strong>MediDeliver Central Warehouse & Inventory</strong>
                <p><strong>Store Manager / Receiver:</strong> {supply.receivedBy || "Admin In-charge"}</p>
                <p><strong>Delivery Status:</strong> {supply.deliveryStatus || "RECEIVED & INSPECTED"}</p>
                <p><strong>Payment Terms:</strong> {supplier.paymentTerms || "Net 30 Days"}</p>
                <p><strong>Preferred Mode:</strong> {(supply.paymentMethod || "BANK_TRANSFER").replace("_", " ")}</p>
                {supply.notes && <p><strong>Remarks:</strong> {supply.notes}</p>}
              </div>
            </div>

            {/* MEDICINES INWARD ITEMS TABLE */}
            <table className="sup-items-table">
              <thead>
                <tr>
                  <th style={{ width: "40px" }}>#</th>
                  <th>Medicine Item & Brand</th>
                  <th>Batch No.</th>
                  <th>Expiry</th>
                  <th>Qty (Units)</th>
                  <th>Unit Price (₹)</th>
                  <th>Total Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {medicines.map((item, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>
                      <strong style={{ color: "#0f172a" }}>{item.medicineName}</strong>
                      {item.companyBrand && (
                        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                          Mfg: {item.companyBrand}
                        </div>
                      )}
                    </td>
                    <td>
                      <code style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px", fontSize: "0.78rem" }}>
                        {item.batchNumber || "N/A"}
                      </code>
                    </td>
                    <td>
                      <span style={{ color: "#475569", fontSize: "0.8rem" }}>
                        {item.expiryDate || "N/A"}
                      </span>
                    </td>
                    <td>
                      <strong>{item.quantity}</strong>
                    </td>
                    <td>₹{Number(item.unitCost || 0).toFixed(2)}</td>
                    <td>
                      <strong>₹{Number(item.totalCost || (item.quantity * item.unitCost) || 0).toFixed(2)}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* FINANCIAL TOTALS & LEDGER */}
            <div className="sup-totals-row">
              <div className="sup-words-box">
                <h6>Invoice Amount in Words:</h6>
                <div className="sup-words-text">{numberToWords(grandTotal)}</div>
                {dueAmount > 0 && (
                  <div style={{ marginTop: "10px", fontSize: "0.8rem", color: "#dc2626", fontWeight: 700 }}>
                    ⚠️ Outstanding Due to Supplier: ₹{dueAmount.toFixed(2)} ({numberToWords(dueAmount)})
                  </div>
                )}
              </div>

              <div>
                <table className="sup-amounts-table">
                  <tbody>
                    <tr>
                      <td>Medicines Subtotal:</td>
                      <td>₹{subtotal.toFixed(2)}</td>
                    </tr>
                    {taxAmount > 0 && (
                      <tr>
                        <td>Applicable GST / Taxes:</td>
                        <td>+₹{taxAmount.toFixed(2)}</td>
                      </tr>
                    )}
                    {discountAmount > 0 && (
                      <tr>
                        <td>Trade Discount / Rebate:</td>
                        <td>-₹{discountAmount.toFixed(2)}</td>
                      </tr>
                    )}
                    <tr className="sup-grand-total-row">
                      <td>Grand Total Billed:</td>
                      <td>₹{grandTotal.toFixed(2)}</td>
                    </tr>
                    <tr className="sup-paid-row">
                      <td>Amount Paid to Supplier:</td>
                      <td>₹{paidAmount.toFixed(2)}</td>
                    </tr>
                    <tr className="sup-due-row">
                      <td>Remaining Baki Due:</td>
                      <td>₹{dueAmount.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* PAYMENT TRANSACTION HISTORY (IF ANY) */}
            {supply.paymentHistory && supply.paymentHistory.length > 0 && (
              <div className="sup-pay-history-box">
                <h5>
                  <CheckCircle2 size={16} /> Recorded Payment Transactions for this Bill
                </h5>
                <table className="sup-pay-history-table">
                  <thead>
                    <tr>
                      <th>Payment Date</th>
                      <th>Method</th>
                      <th>Ref / UTR #</th>
                      <th>Notes</th>
                      <th style={{ textAlign: "right" }}>Amount Paid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supply.paymentHistory.map((ph, pIdx) => (
                      <tr key={pIdx}>
                        <td>{new Date(ph.date).toLocaleDateString("en-IN")}</td>
                        <td>{(ph.method || "BANK").replace("_", " ")}</td>
                        <td>
                          <code>{ph.refNumber || "N/A"}</code>
                        </td>
                        <td>{ph.notes || "-"}</td>
                        <td style={{ textAlign: "right", fontWeight: 700, color: "#16a34a" }}>
                          ₹{Number(ph.amount || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* FOOTER DECLARATION & SIGNATURES */}
            <div className="sup-bill-footer">
              <div className="sup-declaration">
                <p style={{ margin: 0 }}>
                  <strong>Terms & Verification:</strong> All medicines listed in this inward tax invoice have been received in good physical condition, verified against manufacturer batch specs, and logged into central pharmacy storage.
                </p>
              </div>

              <div className="sup-signature-box">
                <div className="sup-signature-line">
                  Authorized Pharmacy Signatory<br />
                  <small style={{ color: "#64748b", fontWeight: 400 }}>MediDeliver Healthcare</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierInvoiceModal;
