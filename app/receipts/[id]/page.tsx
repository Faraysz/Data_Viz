"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { IBM_Plex_Sans } from "next/font/google";

const ibmPlexSans = IBM_Plex_Sans({
  weight: ["400", "500", "600", "700"],
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

  useEffect(() => {
    fetchReceipt();
  }, [params.id]);

  const fetchReceipt = async () => {
    try {
      const res = await fetch(`/api/receipts/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setReceipt(data);
        // Auto print after 1 second
        setTimeout(() => {
          window.print();
        }, 1000);
      }
    } catch (error) {
      console.error('Error fetching receipt:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Memuat kwitansi...</p>
        </div>
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">Kwitansi tidak ditemukan</p>
      </div>
    );
  }

  const formattedDate = new Date(receipt.date).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <>
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .no-print {
            display: none !important;
          }
          .receipt-container {
            width: 210mm;
            height: 148mm;
            margin: 0;
            padding: 0;
            page-break-after: avoid;
          }
        }

        @page {
          size: A5 landscape;
          margin: 0;
        }
      `}</style>

      {/* Screen Toolbar */}
      <div className="no-print fixed top-0 left-0 right-0 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between z-50">
        <h1 className="font-semibold text-slate-900">Kwitansi #{receipt.receiptNumber}</h1>
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Cetak Ulang
          </button>
          <button
            onClick={() => window.close()}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* Receipt Content - A5 Landscape */}
      <div className={`receipt-container bg-white ${ibmPlexSans.className}`} style={{
        width: '210mm',
        height: '148mm',
        margin: '20px auto',
        padding: '10mm 15mm',
        border: '1px solid #e2e8f0',
        position: 'relative',
        boxSizing: 'border-box',
      }}>
        {/* Left Border Decoration */}
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '15px',
          background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, #1e40af 3px, #1e40af 6px)',
          borderRight: '2px solid #1e40af',
        }} />

        {/* KWITANSI Text Vertical */}
        <div style={{
          position: 'absolute',
          left: '3px',
          top: '50%',
          transform: 'translateY(-50%) rotate(-90deg)',
          transformOrigin: 'center',
          fontSize: '18px',
          fontWeight: 'bold',
          letterSpacing: '8px',
          color: '#1e40af',
        }}>
          KWITANSI
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '12px', marginLeft: '20px' }}>
          {/* Logo */}
          <div style={{ marginRight: '15px', flexShrink: 0 }}>
            <Image
              src="/logo.png"
              alt="Logo"
              width={80}
              height={80}
              style={{ objectFit: 'contain' }}
            />
          </div>

          {/* Company Info */}
          <div style={{ flex: 1 }}>
            <h1 style={{
              fontSize: '26px',
              fontWeight: 'bold',
              margin: 0,
              marginBottom: '3px',
              letterSpacing: '1px',
            }}>
              {receipt.company.name}
            </h1>
            <p style={{
              fontSize: '11px',
              margin: 0,
              color: '#334155',
              fontStyle: 'italic',
            }}>
              "V³ D'Craft Inovatif"
            </p>
            <p style={{
              fontSize: '10px',
              margin: 0,
              marginTop: '2px',
              color: '#334155',
            }}>
              Dengan terus datang dan berusaha, aku menaklukkan tantangan dengan mewujudkan mimpi
            </p>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '2px solid #000', margin: '8px 0 8px 20px' }} />

        {/* Receipt Number and Date */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', marginLeft: '20px' }}>
          <div style={{
            border: '2px solid #000',
            padding: '6px 18px',
            borderRadius: '8px',
          }}>
            <span style={{ fontSize: '13px', fontWeight: 'bold' }}>No: {receipt.receiptNumber}</span>
          </div>
          <div style={{
            border: '2px solid #000',
            padding: '6px 18px',
            borderRadius: '8px',
          }}>
            <span style={{ fontSize: '13px' }}>{formattedDate}</span>
          </div>
        </div>

        {/* Receipt Details */}
        <div style={{ marginBottom: '18px', fontSize: '13px', lineHeight: '1.6', marginLeft: '20px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ width: '180px', paddingBottom: '6px' }}>TELAH DITERIMA DARI</td>
                <td style={{ paddingBottom: '6px' }}>: <strong>{receipt.customer.name}</strong></td>
              </tr>
              <tr>
                <td style={{ paddingBottom: '6px' }}>UANG SEJUMLAH</td>
                <td style={{ paddingBottom: '6px' }}>: <strong>{receipt.amountInWords}</strong></td>
              </tr>
              <tr>
                <td style={{ paddingBottom: '6px' }}>UNTUK PEMBAYARAN</td>
                <td style={{ paddingBottom: '6px' }}>: <strong>{receipt.paymentFor}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Amount Box and Signature Side by Side */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginLeft: '20px' }}>
          {/* Amount Box */}
          <div style={{
            border: '3px solid #000',
            borderRadius: '12px',
            padding: '15px 25px',
            textAlign: 'center',
            minWidth: '280px',
          }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold' }}>
              Rp {receipt.amount.toLocaleString('id-ID')}
            </div>
          </div>

          {/* Signature Section */}
          <div style={{ textAlign: 'center', position: 'relative', minWidth: '180px' }}>
            <div style={{ fontSize: '12px', marginBottom: '3px' }}>{formattedDate}</div>
            <div style={{ fontSize: '12px', marginBottom: '5px', fontWeight: 'bold' }}>Penerima</div>

            {/* Stempel dan TTD Overlay */}
            <div style={{ position: 'relative', height: '70px', marginBottom: '5px' }}>
              {/* Stempel */}
              <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
                <Image
                  src="/stempel.png"
                  alt="Stempel"
                  width={90}
                  height={90}
                  style={{ objectFit: 'contain', opacity: 0.7 }}
                />
              </div>

              {/* TTD */}
              <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
                <Image
                  src="/ttd.png"
                  alt="Tanda Tangan"
                  width={100}
                  height={50}
                  style={{ objectFit: 'contain' }}
                />
              </div>
            </div>

            <div style={{
              borderBottom: '2px solid #000',
              paddingBottom: '3px',
              fontSize: '12px',
            }}>
              <strong>({receipt.receivedBy})</strong>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
