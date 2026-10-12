"use client";
import { useState, useEffect } from "react";
import { Plus, Package, DollarSign, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { ORDER_STATUS_LABELS, STATUS_COLORS } from "@/lib/company-config";
import AddOrderModal from "@/components/AddOrderModal";
import OrderDetailModal from "@/components/OrderDetailModal";

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

interface Summary {
  orders: {
    total: number;
    pending: number;
    production: number;
    ready: number;
  };
  finance: {
    totalRevenue: number;
    totalPaid: number;
    totalPending: number;
    todayRevenue: number;
  };
}

export default function Dashboard() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersRes, summaryRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/summary'),
      ]);

      const ordersData = await ordersRes.json();
      const summaryData = await summaryRes.json();

      setAllOrders(ordersData);
      setSummary(summaryData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              CV. AKSARA INOVATIF
            </h1>
            <p className="text-slate-500 mt-1">Sistem Manajemen Pesanan Konveksi</p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 w-fit"
          >
            <Plus className="w-5 h-5" />
            Buat Pesanan Baru
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div 
            onClick={() => setStatusFilter("ALL")}
            className={`p-6 rounded-xl border shadow-sm cursor-pointer transition-all ${
              statusFilter === "ALL" 
                ? "bg-blue-50/50 border-blue-400 ring-2 ring-blue-500/20" 
                : "bg-white border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-500">Total Semua Pesanan</h3>
              <div className="p-2 rounded-lg bg-blue-50">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{summary?.orders.total || 0}</p>
            <p className="text-xs text-slate-500 mt-1">Klik untuk lihat semua</p>
          </div>

          <div 
            onClick={() => setStatusFilter("UNPAID")}
            className={`p-6 rounded-xl border shadow-sm cursor-pointer transition-all ${
              statusFilter === "UNPAID" 
                ? "bg-amber-50/70 border-amber-400 ring-2 ring-amber-500/30" 
                : "bg-white border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-500">Belum Lunas (Sisa Tagihan)</h3>
              <div className="p-2 rounded-lg bg-amber-50">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-amber-600">
              {formatRupiah(summary?.finance.totalPending || 0)}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              <span className="font-semibold text-amber-700">
                {allOrders.filter(o => o.remainingAmount > 0).length} pesanan
              </span> belum lunas
            </p>
          </div>

          <div 
            onClick={() => setStatusFilter("READY")}
            className={`p-6 rounded-xl border shadow-sm cursor-pointer transition-all ${
              statusFilter === "READY" 
                ? "bg-green-50/50 border-green-400 ring-2 ring-green-500/20" 
                : "bg-white border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-500">Siap Diambil</h3>
              <div className="p-2 rounded-lg bg-green-50">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-green-600">{summary?.orders.ready || 0}</p>
            <p className="text-xs text-slate-500 mt-1">Selesai produksi & siap kirim</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-500">Bayar Hari Ini</h3>
              <div className="p-2 rounded-lg bg-emerald-50">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-emerald-600">
              {formatRupiah(summary?.finance.todayRevenue || 0)}
            </p>
            <p className="text-xs text-slate-500 mt-1">Total uang masuk hari ini</p>
          </div>
        </div>

        {/* Orders Table Container */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          {/* Header & Filter Tabs */}
          <div className="p-6 border-b border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {statusFilter === "ALL" && `Semua Pesanan (${allOrders.length})`}
                  {statusFilter === "UNPAID" && `Pesanan Belum Lunas (${allOrders.filter(o => o.remainingAmount > 0).length})`}
                  {statusFilter === "PAID" && `Pesanan Lunas (${allOrders.filter(o => o.remainingAmount <= 0).length})`}
                  {statusFilter === "ACTIVE" && `Pesanan Aktif (${allOrders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED').length})`}
                  {statusFilter === "READY" && `Pesanan Siap Diambil (${allOrders.filter(o => o.status === 'READY').length})`}
                  {statusFilter === "COMPLETED" && `Pesanan Selesai / Diambil (${allOrders.filter(o => o.status === 'COMPLETED').length})`}
                  {statusFilter === "PENDING" && `Pesanan Menunggu / Pending (${allOrders.filter(o => o.status === 'PENDING').length})`}
                  {statusFilter === "PRODUCTION" && `Pesanan Sedang Produksi (${allOrders.filter(o => o.status === 'PRODUCTION').length})`}
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  {statusFilter === "ALL" 
                    ? "Menampilkan keseluruhan pesanan baik yang sedang berjalan maupun selesai" 
                    : statusFilter === "UNPAID"
                    ? "Daftar pesanan yang masih memiliki sisa tagihan yang harus dibayar/dilunasi"
                    : statusFilter === "PAID"
                    ? "Daftar pesanan yang pembayarannya sudah 100% lunas"
                    : statusFilter === "ACTIVE" 
                    ? "Pesanan yang sedang dikerjakan atau menunggu pengambilan & pelunasan" 
                    : `Menampilkan pesanan dengan filter ${statusFilter}`}
                </p>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 pt-2">
              {[
                { key: "ALL", label: "Semua", count: allOrders.length },
                { 
                  key: "UNPAID", 
                  label: "⚠️ Belum Lunas", 
                  count: allOrders.filter(o => o.remainingAmount > 0).length,
                  highlight: "unpaid"
                },
                { 
                  key: "PAID", 
                  label: "✓ Lunas", 
                  count: allOrders.filter(o => o.remainingAmount <= 0).length,
                  highlight: "paid"
                },
                { 
                  key: "ACTIVE", 
                  label: "Aktif", 
                  count: allOrders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED').length 
                },
                { 
                  key: "READY", 
                  label: "Siap Diambil", 
                  count: allOrders.filter(o => o.status === 'READY').length 
                },
                { 
                  key: "PRODUCTION", 
                  label: "Produksi", 
                  count: allOrders.filter(o => o.status === 'PRODUCTION').length 
                },
                { 
                  key: "PENDING", 
                  label: "Pending", 
                  count: allOrders.filter(o => o.status === 'PENDING').length 
                },
                { 
                  key: "COMPLETED", 
                  label: "Selesai", 
                  count: allOrders.filter(o => o.status === 'COMPLETED').length 
                },
              ].map((tab) => {
                const isActive = statusFilter === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setStatusFilter(tab.key)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      isActive
                        ? tab.highlight === "unpaid"
                          ? "bg-amber-600 text-white shadow-sm"
                          : tab.highlight === "paid"
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "bg-slate-900 text-white shadow-sm"
                        : tab.highlight === "unpaid"
                        ? "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
                        : tab.highlight === "paid"
                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-xs font-semibold ${
                      isActive 
                        ? "bg-black/20 text-white" 
                        : tab.highlight === "unpaid"
                        ? "bg-amber-200 text-amber-800"
                        : tab.highlight === "paid"
                        ? "bg-emerald-200 text-emerald-800"
                        : "bg-slate-200 text-slate-700"
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="divide-y divide-slate-200">
            {allOrders
              .filter((order) => {
                if (statusFilter === "ALL") return true;
                if (statusFilter === "UNPAID") return order.remainingAmount > 0;
                if (statusFilter === "PAID") return order.remainingAmount <= 0;
                if (statusFilter === "ACTIVE") return order.status !== "COMPLETED" && order.status !== "CANCELLED";
                return order.status === statusFilter;
              })
              .length === 0 ? (
              <div className="p-12 text-center">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">Tidak ada pesanan pada filter ini</p>
                {statusFilter !== "ALL" && (
                  <button
                    onClick={() => setStatusFilter("ALL")}
                    className="mt-3 text-sm text-blue-600 hover:underline font-medium"
                  >
                    Tampilkan Semua Pesanan
                  </button>
                )}
              </div>
            ) : (
              allOrders
                .filter((order) => {
                  if (statusFilter === "ALL") return true;
                  if (statusFilter === "UNPAID") return order.remainingAmount > 0;
                  if (statusFilter === "PAID") return order.remainingAmount <= 0;
                  if (statusFilter === "ACTIVE") return order.status !== "COMPLETED" && order.status !== "CANCELLED";
                  return order.status === statusFilter;
                })
                .map((order) => (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="p-6 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-mono text-sm font-medium text-slate-600">
                            {order.orderNumber}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[order.status as keyof typeof STATUS_COLORS]}`}>
                            {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS]}
                          </span>
                          {order.remainingAmount > 0 ? (
                            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                              Belum Lunas
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              Lunas
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-slate-900 mb-1">
                          {order.customer.name}
                        </h3>
                        <p className="text-slate-600 mb-2">
                          {order.description} - {order.quantity} {order.unit}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-slate-500">
                            Total: <span className="font-semibold text-slate-900">{formatRupiah(order.totalPrice)}</span>
                          </span>
                          {order.remainingAmount > 0 ? (
                            <span className="text-amber-700 font-medium">
                              Sisa Tagihan: <span className="font-bold text-amber-800">{formatRupiah(order.remainingAmount)}</span>
                            </span>
                          ) : (
                            <span className="text-emerald-700 font-medium">
                              Sudah Dibayar Penuh ({formatRupiah(order.paidAmount)})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddOrderModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchData}
      />

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
}
