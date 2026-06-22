"use client";
import { useState, useEffect } from "react";
import SummaryCard from "@/components/SummaryCard";
import FinanceChart from "@/components/FinanceChart";
import RecentTransactions from "@/components/RecentTransactions";
import AddTransactionModal from "@/components/AddTransactionModal";

interface Transaction {
  id: string;
  description: string;
  category: string;
  amount: number;
  type: string;
  date: string;
}

interface Summary {
  balance: number;
  income: number;
  expense: number;
}

interface ChartData {
  name: string;
  income: number;
  expense: number;
}

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<Summary>({ balance: 0, income: 0, expense: 0 });
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data dari API
  const fetchData = async () => {
    try {
      setLoading(true);
      const [transactionsRes, summaryRes, chartRes] = await Promise.all([
        fetch('/api/transactions'),
        fetch('/api/summary'),
        fetch('/api/chart'),
      ]);

      const transactionsData = await transactionsRes.json();
      const summaryData = await summaryRes.json();
      const chartDataRes = await chartRes.json();

      setTransactions(transactionsData);
      setSummary(summaryData);
      setChartData(chartDataRes);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddTransaction = async (newTransaction: any) => {
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTransaction),
      });

      if (response.ok) {
        // Refresh data setelah berhasil tambah transaksi
        await fetchData();
      } else {
        alert('Gagal menambahkan transaksi');
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('Terjadi kesalahan saat menambahkan transaksi');
    }
  };

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
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Dashboard Keuangan</h1>
            <p className="text-slate-500 mt-1">Pantau arus kas dan prediksi keuanganmu di sini.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 w-fit"
          >
            + Tambah Transaksi
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SummaryCard title="Total Saldo" amount={summary.balance} type="balance" />
          <SummaryCard title="Pemasukan (Bulan Ini)" amount={summary.income} type="income" />
          <SummaryCard title="Pengeluaran (Bulan Ini)" amount={summary.expense} type="expense" />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <FinanceChart data={chartData} />
          </div>
          
          <div className="lg:col-span-1">
            <RecentTransactions transactions={transactions} onRefresh={fetchData} />
          </div>
        </div>

      </div>

      {/* Modal Tambah Transaksi */}
      <AddTransactionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddTransaction}
      />
    </div>
  );
}
