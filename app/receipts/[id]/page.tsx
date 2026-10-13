"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Work_Sans, Playfair_Display } from "next/font/google";
import { Printer, Download, Copy, Check, Loader2 } from "lucide-react";
import { toPng, toBlob } from "html-to-image";

const workSans = Work_Sans({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  weight: ["700", "800", "900"],
  subsets: ["latin"],
});

interface ReceiptData {
  company: {
    name: string;
    address: string;
    phone: string;
  };
  receiptNumber: string;
  date: string;
  customer: {
    name: string;
  };
  amount: number;
  amountInWords: string;
  paymentFor: string;
  quantity: number;
  unit: string;
  paymentMethod: string;
  accountNumber?: string;
  accountName?: string;
  bankName?: string;
  receivedBy: string;
}

export default function ReceiptPage() {
  const params = useParams();
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchReceipt();
  }, [params.id]);

  const fetchReceipt = async () => {
    try {
      const res = await fetch(`/api/receipts/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setReceipt(data);
      }
    } catch (error) {
      console.error("Error fetching receipt:", error);
    } finally {
      setLoading(false);
    }
  };

  // Download Kwitansi sebagai file gambar .PNG beresolusi tinggi (Fix: anti-kepotong)
  const handleDownloadPng = async () => {
    if (!receiptRef.current) return;
    try {
      setIsDownloading(true);
      const node = receiptRef.current;
      const width = 860;
      const height = 448;

      const dataUrl = await toPng(node, {
        cacheBust: true,
        width: width,
        height: height,
        canvasWidth: width * 2,
        canvasHeight: height * 2,
        pixelRatio: 2, // Resolusi tinggi tajam untuk WA
        backgroundColor: "#ffffff",
        style: {
          margin: "0",
          transform: "none",
          position: "static",
        },
      });

      const customerSlug = (receipt?.customer?.name || "Customer")
        .trim()
        .replace(/[^a-zA-Z0-9]/g, "_");
      const filename = `Kwitansi-${receipt?.receiptNumber || "Aksara"}-${customerSlug}.png`;

      const link = document.createElement("a");
      link.download = filename;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Gagal mendownload gambar kwitansi:", error);
      alert("Gagal mengunduh gambar kwitansi. Silakan coba lagi.");
    } finally {
      setIsDownloading(false);
    }
  };

  // Salin langsung ke Clipboard agar admin bisa langsung tekan Ctrl+V di WhatsApp Web
  const handleCopyImage = async () => {
    if (!receiptRef.current) return;
    try {
      const node = receiptRef.current;
      const width = 860;
      const height = 448;

      const blob = await toBlob(node, {
        cacheBust: true,
        width: width,
        height: height,
        canvasWidth: width * 2,
        canvasHeight: height * 2,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        style: {
          margin: "0",
          transform: "none",
          position: "static",
        },
      });

      if (blob && navigator.clipboard && typeof window.ClipboardItem !== "undefined") {
        await navigator.clipboard.write([
          new window.ClipboardItem({ "image/png": blob }),
        ]);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
      } else {
        handleDownloadPng();
      }
    } catch (error) {
      console.error("Gagal menyalin gambar:", error);
      handleDownloadPng();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 font-medium">Memuat kwitansi...</p>
        </div>
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="bg-white p-6 rounded-xl shadow-md text-center">
          <p className="text-red-600 font-semibold mb-4">Kwitansi tidak ditemukan</p>
          <button
            onClick={() => window.close()}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900"
          >
            Tutup Jendela
          </button>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(receipt.date).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Susun deskripsi metode pembayaran yang rapi
  let displayPaymentMethod = (receipt.paymentMethod || "Tunai").replace(/\s*-\s*$/, "").trim();
  if (
    receipt.accountNumber &&
    !displayPaymentMethod.includes(receipt.accountNumber)
  ) {
    displayPaymentMethod += ` - ${receipt.accountNumber}${receipt.accountName ? ` ${receipt.accountName}` : ""}`;
  }

  return (
    <div className={`receipt-page-wrapper min-h-screen bg-slate-200 py-8 px-4 flex flex-col items-center justify-center ${workSans.className}`}>
      {/* Print Styles */}
      <style jsx global>{`
        @page {
          size: A5 landscape;
          margin: 0;
        }

        @media print {
          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .no-print {
            display: none !important;
          }

          .receipt-page-wrapper {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            min-height: auto !important;
            display: block !important;
          }

          .receipt-container {
            margin: 0 auto !important;
            box-shadow: none !important;
            width: 210mm !important;
            height: 110mm !important;
            max-height: 148mm !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      {/* Screen Toolbar */}
      <div className="no-print w-full max-w-[860px] mb-4 bg-white border border-slate-300 rounded-xl px-5 py-3 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-900 text-sm">
            Kwitansi #{receipt.receiptNumber}
          </span>
          <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full font-medium">
            Format Resmi CV. Aksara Inovatif
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Tombol Download PNG Langsung (Klien bisa langsung lihat gambar di WA) */}
          <button
            onClick={handleDownloadPng}
            disabled={isDownloading}
            title="Download gambar PNG berkualitas tinggi untuk dikirim ke klien via WhatsApp"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-lg text-xs md:text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses PNG...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Gambar (.PNG)</span>
              </>
            )}
          </button>

          {/* Tombol Salin Gambar (Bisa langsung Ctrl+V di WhatsApp Web) */}
          <button
            onClick={handleCopyImage}
            title="Salin gambar kwitansi ke clipboard (langsung Ctrl+V di WhatsApp)"
            className="px-3.5 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs md:text-sm font-medium transition-colors flex items-center gap-1.5"
          >
            {isCopied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Tersalin ke Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Salin Gambar</span>
              </>
            )}
          </button>

          {/* Tombol Cetak / PDF */}
          <button
            onClick={() => window.print()}
            title="Cetak kwitansi ke printer atau simpan sebagai PDF"
            className="px-3.5 py-2 border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs md:text-sm font-medium transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / PDF</span>
          </button>

          <button
            onClick={() => window.close()}
            className="px-3 py-2 border border-slate-300 text-slate-600 hover:bg-slate-50 rounded-lg text-xs md:text-sm font-medium transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* Container Centering & Horizontal Scroll di Layar HP */}
      <div className="w-full flex justify-center overflow-x-auto pb-8">
        <div className="shadow-2xl rounded-sm inline-block shrink-0">
          {/* Receipt Frame - Rasio 1.92:1 (seperti kwitansi-rebuild.png: 1352x704) */}
          <div
            ref={receiptRef}
            className="receipt-container bg-white"
            style={{
              width: "860px",
              height: "448px",
              boxSizing: "border-box",
              backgroundColor: "#ffffff",
              border: "2.8px solid #825927",
              padding: "3.5px",
              position: "relative",
              margin: 0,
            }}
          >
        {/* Inner Border Frame */}
        <div
          style={{
            border: "1px solid #825927",
            height: "100%",
            width: "100%",
            boxSizing: "border-box",
            padding: "18px 28px 18px 28px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
            backgroundColor: "#ffffff",
            overflow: "hidden",
          }}
        >
          {/* Watermark Logo Wayang di Tengah Background */}
          <div
            style={{
              position: "absolute",
              left: "48%",
              top: "52%",
              transform: "translate(-50%, -50%)",
              opacity: 0.055,
              pointerEvents: "none",
              zIndex: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              userSelect: "none",
            }}
          >
            <Image
              src="/logo.png"
              alt="Watermark Aksara"
              width={190}
              height={190}
              style={{ objectFit: "contain" }}
              priority
            />
            <span
              style={{
                fontSize: "13px",
                fontWeight: "800",
                letterSpacing: "3px",
                marginTop: "2px",
                color: "#825927",
              }}
            >
              AKSARA ORGANIZER
            </span>
          </div>

          {/* 1. Header (Logo, Nama Perusahaan & Kwitansi No) */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              position: "relative",
              zIndex: 1,
            }}
          >
            {/* Kiri: Logo Wayang + Nama Perusahaan */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  flexShrink: 0,
                }}
              >
                <Image
                  src="/logo.png"
                  alt="Logo Aksara"
                  width={56}
                  height={62}
                  style={{ objectFit: "contain" }}
                  priority
                />
                <span
                  style={{
                    fontSize: "7.5px",
                    fontWeight: "700",
                    letterSpacing: "0.8px",
                    color: "#0c2136",
                    marginTop: "2px",
                  }}
                >
                  AKSARA ORGANIZER
                </span>
              </div>

              <div>
                <h1
                  style={{
                    fontSize: "26px",
                    fontWeight: "800",
                    color: "#0c2136",
                    margin: 0,
                    letterSpacing: "0.5px",
                    lineHeight: 1.15,
                  }}
                >
                  {receipt.company.name}
                </h1>
                <p
                  style={{
                    fontSize: "11px",
                    color: "#1e293b",
                    margin: "3px 0 0 0",
                    fontWeight: "500",
                    letterSpacing: "0.2px",
                  }}
                >
                  {receipt.company.address}. {receipt.company.phone}
                </p>
              </div>
            </div>

            {/* Kanan: Tipografi KWITANSI & Nomor */}
            <div style={{ textAlign: "right" }}>
              <div
                className={playfair.className}
                style={{
                  fontSize: "36px",
                  fontWeight: "700",
                  color: "#0c2136",
                  letterSpacing: "2.5px",
                  lineHeight: 1,
                }}
              >
                KWITANSI
              </div>
              <div
                style={{
                  fontSize: "15px",
                  fontWeight: "700",
                  color: "#0f172a",
                  marginTop: "6px",
                  letterSpacing: "0.5px",
                }}
              >
                No: {receipt.receiptNumber}
              </div>
            </div>
          </div>

          {/* 2. Isi Kwitansi (Tabel Detail Transaksi) */}
          <div
            style={{
              position: "relative",
              zIndex: 1,
              margin: "8px 0 6px 0",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "13px",
              }}
            >
              <tbody>
                <tr>
                  <td
                    style={{
                      width: "215px",
                      padding: "5.5px 0",
                      color: "#334155",
                      fontWeight: 600,
                      letterSpacing: "0.5px",
                      verticalAlign: "top",
                    }}
                  >
                    TELAH DITERIMA DARI
                  </td>
                  <td
                    style={{
                      padding: "5.5px 0",
                      color: "#000000",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.3px",
                    }}
                  >
                    : {receipt.customer.name}
                  </td>
                </tr>

                <tr>
                  <td
                    style={{
                      width: "215px",
                      padding: "6px 0",
                      color: "#334155",
                      fontWeight: 600,
                      letterSpacing: "0.5px",
                      verticalAlign: "top",
                    }}
                  >
                    UANG SEJUMLAH
                  </td>
                  <td
                    style={{
                      padding: "6px 0",
                      color: "#000000",
                      fontWeight: 700,
                      fontStyle: "italic",
                      textTransform: "uppercase",
                      lineHeight: 1.45,
                      letterSpacing: "0.2px",
                    }}
                  >
                    : {receipt.amountInWords}
                  </td>
                </tr>

                <tr>
                  <td
                    style={{
                      width: "215px",
                      padding: "5.5px 0",
                      color: "#334155",
                      fontWeight: 600,
                      letterSpacing: "0.5px",
                      verticalAlign: "top",
                    }}
                  >
                    UNTUK PEMBAYARAN
                  </td>
                  <td
                    style={{
                      padding: "5.5px 0",
                      color: "#000000",
                      fontWeight: 700,
                      letterSpacing: "0.2px",
                    }}
                  >
                    : {receipt.paymentFor}
                    {receipt.quantity ? ` (${receipt.quantity} ${receipt.unit || "pcs"})` : ""}
                  </td>
                </tr>

                <tr>
                  <td
                    style={{
                      width: "215px",
                      padding: "5.5px 0",
                      color: "#334155",
                      fontWeight: 600,
                      letterSpacing: "0.5px",
                      verticalAlign: "top",
                    }}
                  >
                    METODE PEMBAYARAN
                  </td>
                  <td
                    style={{
                      padding: "5.5px 0",
                      color: "#000000",
                      fontWeight: 600,
                      letterSpacing: "0.2px",
                    }}
                  >
                    : {displayPaymentMethod}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 3. Footer: Kotak Nominal Gelap Berbingkai Emas & Tanda Tangan Penerima */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              position: "relative",
              zIndex: 1,
            }}
          >
            {/* Kiri: Kotak Nominal Navy dengan Border Gold Tebal */}
            <div
              style={{
                backgroundColor: "#0d2136",
                border: "3.5px solid #c59b27",
                borderRadius: "16px",
                padding: "8px 28px",
                boxShadow: "0 3px 8px rgba(0,0,0,0.18)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: "260px",
              }}
            >
              <span
                style={{
                  fontSize: "33px",
                  fontWeight: "800",
                  color: "#ffffff",
                  letterSpacing: "0.5px",
                  lineHeight: 1.15,
                }}
              >
                Rp {receipt.amount.toLocaleString("id-ID")}
              </span>
            </div>

            {/* Kanan: Tanggal, Penerima, Stempel Bulat + TTD Otentik, Nama Penerima */}
            <div
              style={{
                textAlign: "center",
                minWidth: "210px",
                paddingRight: "4px",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: "#0f172a",
                  fontWeight: "500",
                  letterSpacing: "0.2px",
                }}
              >
                {formattedDate}
              </div>

              <div
                style={{
                  fontSize: "12px",
                  color: "#0f172a",
                  fontWeight: "600",
                  marginTop: "1px",
                }}
              >
                Penerima
              </div>

              {/* Stempel Bulat & Tanda Tangan Otentik Gabungan */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "64px",
                  margin: "1px 0",
                }}
              >
                <Image
                  src="/stempel-ttd-asli.png"
                  alt="Stempel dan Tanda Tangan Penerima"
                  width={185}
                  height={62}
                  style={{ objectFit: "contain" }}
                  priority
                />
              </div>

              {/* Nama Penerima */}
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "#0f172a",
                  letterSpacing: "0.3px",
                }}
              >
                ( {receipt.receivedBy} )
              </div>
            </div>
          </div>
        </div>
      </div>
        </div>
      </div>
    </div>
  );
}
