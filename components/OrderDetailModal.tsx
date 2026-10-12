"use client";
import { useState, useEffect } from "react";
import { X, DollarSign, Printer } from "lucide-react";
import { formatRupiah, formatDate } from "@/lib/utils";
import { ORDER_STATUS_LABELS, STATUS_COLORS, PAYMENT_TYPE_LABELS } from "@/lib/company-config";
import AddPaymentModal from "@/components/AddPaymentModal";

interface Order {
  id: string;
  orderNumber: string;
  description: string;
  quantity: number;
  unit: string;
  totalPrice: number;
  paidAmount: number;
  remainingAmount: number;
  status: string;
  orderDate: string;
  customer: {
    name: string;
    phone: string;
  };
}

interface OrderDetail extends Order {
  pricePerUnit: number;
  specifications?: string;
  notes?: string;
  dueDate?: string;
  completedDate?: string;
  payments: Array<{
    id: string;
    receiptNumber: string;
    amount: number;
    paymentType: string;
    paymentMethod: string;
    paymentDate: string;
  }>;
}

interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
  onSuccess: () => void;
}

export default function OrderDetailModal({ order, onClose, onSuccess }: OrderDetailModalProps) {
  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetail();
  }, [order.id]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/orders/${order.id}`);
      const data = await res.json();
      setOrderDetail(data);
    } catch (error) {
      console.error('Error fetching order detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: order.id,
          status: newStatus,
        }),
      });

      if (res.ok) {
        fetchOrderDetail();
        onSuccess();
      } else {
        alert('Gagal mengubah status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Terjadi kesalahan');
    }
  };

  const handlePaymentSuccess = () => {
    fetchOrderDetail();
    onSuccess();
    setIsPaymentModalOpen(false);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/15 backdrop-blur-md flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!orderDetail) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/15 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Detail Pesanan</h2>
              <p className="text-sm text-slate-500 font-mono">{orderDetail.orderNumber}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Customer Info */}
            <div>
              <h3 className="font-medium text-slate-900 mb-3">Informasi Customer</h3>
              <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Nama:</span>
                  <span className="font-medium text-slate-900">{orderDetail.customer.name}</span>
                </div>
                {orderDetail.customer.phone && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Telepon:</span>
                    <span className="font-medium text-slate-900">{orderDetail.customer.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Order Info */}
            <div>
              <h3 className="font-medium text-slate-900 mb-3">Detail Pesanan</h3>
              <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Produk:</span>
                  <span className="font-medium text-slate-900">{orderDetail.description}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Jumlah:</span>
                  <span className="font-medium text-slate-900">{orderDetail.quantity} {orderDetail.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Harga/unit:</span>
                  <span className="font-medium text-slate-900">{formatRupiah(orderDetail.pricePerUnit)}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-slate-900 font-medium">Total:</span>
                  <span className="font-bold text-slate-900">{formatRupiah(orderDetail.totalPrice)}</span>
                </div>
                {orderDetail.specifications && (
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-slate-600 block mb-1">Spesifikasi:</span>
                    <span className="text-slate-900">{orderDetail.specifications}</span>
                  </div>
                )}
                {orderDetail.notes && (
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-slate-600 block mb-1">Catatan:</span>
                    <span className="text-slate-900">{orderDetail.notes}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Status:</span>
                    <select
                      value={orderDetail.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className={`px-2 py-1 rounded text-xs font-medium ${STATUS_COLORS[orderDetail.status as keyof typeof STATUS_COLORS]}`}
                    >
                      <option value="PENDING">Menunggu</option>
                      <option value="PRODUCTION">Produksi</option>
                      <option value="READY">Siap Diambil</option>
                      <option value="COMPLETED">Selesai</option>
                      <option value="CANCELLED">Dibatalkan</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-slate-900">Pembayaran</h3>
                {orderDetail.remainingAmount > 0 && (
                  <button
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                  >
                    <DollarSign className="w-4 h-4" />
                    Terima Pembayaran
                  </button>
                )}
              </div>

              <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">Sudah Dibayar:</span>
                  <span className="font-medium text-green-600">{formatRupiah(orderDetail.paidAmount)}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-slate-900 font-medium">Sisa:</span>
                  <span className={`font-bold ${orderDetail.remainingAmount > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                    {formatRupiah(orderDetail.remainingAmount)}
                  </span>
                </div>
              </div>

              {/* Payment History */}
              {orderDetail.payments.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-slate-700 mb-2">Riwayat Pembayaran</h4>
                  <div className="space-y-2">
                    {orderDetail.payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="border border-slate-200 rounded-lg p-3 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-sm font-medium text-slate-600">
                            No. {payment.receiptNumber}
                          </span>
                          <button
                            onClick={() => window.open(`/receipts/${payment.id}`, '_blank')}
                            className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
                          >
                            <Printer className="w-4 h-4" />
                            Cetak
                          </button>
                        </div>
                        <div className="flex justify-between items-start">
                          <div className="text-sm">
                            <span className="text-slate-600">{formatDate(new Date(payment.paymentDate))}</span>
                            <span className="mx-2">•</span>
                            <span className="text-slate-700">{PAYMENT_TYPE_LABELS[payment.paymentType as keyof typeof PAYMENT_TYPE_LABELS]}</span>
                            <span className="mx-2">•</span>
                            <span className="text-slate-700">{payment.paymentMethod}</span>
                          </div>
                          <span className="font-semibold text-slate-900">{formatRupiah(payment.amount)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="sticky bottom-0 bg-slate-50 px-6 py-4 border-t border-slate-200">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>

      {isPaymentModalOpen && (
        <AddPaymentModal
          order={orderDetail}
          onClose={() => setIsPaymentModalOpen(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
}
