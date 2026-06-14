import SummaryCard from "@/components/SummaryCard";
import FinanceChart from "@/components/FinanceChart";
import RecentTransactions from "@/components/RecentTransactions";
import { mockSummary, mockChartData, mockTransactions } from "@/lib/mock-data";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Dashboard Keuangan</h1>
            <p className="text-slate-500 mt-1">Pantau arus kas dan prediksi keuanganmu di sini.</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 w-fit">
            + Tambah Transaksi
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SummaryCard title="Total Saldo" amount={mockSummary.balance} type="balance" />
          <SummaryCard title="Pemasukan (Bulan Ini)" amount={mockSummary.income} type="income" />
          <SummaryCard title="Pengeluaran (Bulan Ini)" amount={mockSummary.expense} type="expense" />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart mengambil 2 kolom di layar besar */}
          <div className="lg:col-span-2">
            <FinanceChart data={mockChartData} />
          </div>
          
          {/* Recent Transactions mengambil 1 kolom */}
          <div className="lg:col-span-1">
            <RecentTransactions transactions={mockTransactions} />
          </div>
        </div>

      </div>
    </div>
  );
}