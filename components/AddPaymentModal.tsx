"use client";
import { useState } from "react";
import { X } from "lucide-react";
import { formatRupiah, cleanText } from "@/lib/utils";
import { COMPANY_INFO, PAYMENT_TYPE_LABELS } from "@/lib/company-config";

interface Order {
  id: string;
  orderNumber: string;
  totalPrice: number;
  paidAmount: number;
  remainingAmount: number;
  customer: {
    name: string;
  };
}

interface AddPaymentModalProps {
  order: Order;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddPaymentModal({ order, onClose, onSuccess }: AddPaymentModalProps) {
  const [amount, setAmount] = useState(order.remainingAmount.toString());
  const [paymentType, setPaymentType] = useState<"DP" | "CICILAN" | "PELUNASAN">(
    order.paidAmount === 0 ? "DP" : order.remainingAmount <= parseFloat(amount) ? "PELUNASAN" : "CICILAN"
  );
  const [selectedBank, setSelectedBank] = useState(COMPANY_INFO.banks[0]?.id || "");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAmountChange = (value: string) => {
    setAmount(value);
    const numAmount = parseFloat(value) || 0;

    if (order.paidAmount === 0 && numAmount < order.totalPrice) {
      setPaymentType("DP");
    } else if (numAmount >= order.remainingAmount) {
      setPaymentType("PELUNASAN");
    } else {
      setPaymentType("CICILAN");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const numAmount = parseFloat(amount);
    if (numAmount <= 0 || numAmount > order.remainingAmount) {
      alert(`Jumlah pembayaran harus antara Rp 1 dan ${formatRupiah(order.remainingAmount)}`);
      setLoading(false);
      return;
    }

    const selectedBankInfo = COMPANY_INFO.banks.find(b => b.id === selectedBank);

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          amount: numAmount,
          paymentType,
          paymentMethod: `Transfer ${selectedBankInfo?.name}`,
          accountNumber: selectedBankInfo?.accountNumber,
          accountName: selectedBankInfo?.accountName,
          bankName: selectedBankInfo?.name,
          paymentDate,
          notes: cleanText(notes, true) || null,
          receivedBy: COMPANY_INFO.defaultReceiverName,
        }),
      });

      if (res.ok) {
        const payment = await res.json();
        // Open receipt in new tab
        window.open(`/receipts/${payment.id}`, '_blank');
        onSuccess();
      } else {
        alert('Gagal mencatat pembayaran');
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      alert('Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const bank = COMPANY_INFO.banks.find(b => b.id === selectedBank);

  return (
    <div 
      className="fixed inset-0 bg-black/15 backdrop-blur-md flex items-center justify-center z-[60] p-4 overflow-y-auto transition-all"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden my-auto">
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
          <h2 className="text-xl font-semibold text-slate-900">Terima Pembayaran</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Order Info */}
          <div className="bg-slate-50 p-4 rounded-lg space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Pesanan:</span>
              <span className="font-medium text-slate-900">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Customer:</span>
              <span className="font-medium text-slate-900">{order.customer.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Total:</span>
              <span className="font-medium text-slate-900">{formatRupiah(order.totalPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Sudah Dibayar:</span>
              <span className="font-medium text-green-600">{formatRupiah(order.paidAmount)}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-slate-900 font-medium">Sisa:</span>
              <span className="font-bold text-orange-600">{formatRupiah(order.remainingAmount)}</span>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Jumlah Bayar <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              min="1"
              max={order.remainingAmount}
              step="0.01"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
              required
            />
          </div>

          {/* Payment Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tipe Pembayaran
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={paymentType === "DP"}
                  onChange={() => setPaymentType("DP")}
                  className="w-4 h-4 text-blue-600"
                  disabled={order.paidAmount > 0}
                />
                <span className="text-sm text-slate-700">{PAYMENT_TYPE_LABELS.DP}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={paymentType === "CICILAN"}
                  onChange={() => setPaymentType("CICILAN")}
                  className="w-4 h-4 text-blue-600"
                  disabled={parseFloat(amount) >= order.remainingAmount}
                />
                <span className="text-sm text-slate-700">{PAYMENT_TYPE_LABELS.CICILAN}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={paymentType === "PELUNASAN"}
                  onChange={() => setPaymentType("PELUNASAN")}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-slate-700">{PAYMENT_TYPE_LABELS.PELUNASAN}</span>
              </label>
            </div>
          </div>

          {/* Bank Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Transfer ke <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {COMPANY_INFO.banks.map((bankInfo) => (
                <label
                  key={bankInfo.id}
                  className="flex items-start gap-2 cursor-pointer p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <input
                    type="radio"
                    checked={selectedBank === bankInfo.id}
                    onChange={() => setSelectedBank(bankInfo.id)}
                    className="w-4 h-4 text-blue-600 mt-0.5"
                  />
                  <div className="text-sm flex-1">
                    <div className="font-medium text-slate-900">{bankInfo.name}</div>
                    <div className="text-slate-600">{bankInfo.accountNumber}</div>
                    <div className="text-slate-500">{bankInfo.accountName}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Payment Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tanggal Pembayaran <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
              required
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Catatan
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onPaste={(e) => {
                e.preventDefault();
                const raw = e.clipboardData.getData("text");
                setNotes(cleanText(raw, true));
              }}
              onBlur={() => setNotes((v) => cleanText(v, true))}
              rows={2}
              placeholder="Catatan tambahan (opsional)"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : 'Simpan & Cetak Kwitansi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
