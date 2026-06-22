import { ArrowUpRight, ArrowDownRight, ShoppingBag, Utensils, FileText, Briefcase, Trash2 } from "lucide-react";
import { formatRupiah, formatDate } from "@/lib/utils";

const categoryIcons: Record<string, any> = {
  Pendapatan: <Briefcase className="w-4 h-4 text-emerald-600" />,
  Gaji: <Briefcase className="w-4 h-4 text-emerald-600" />,
  Freelance: <Briefcase className="w-4 h-4 text-emerald-600" />,
  Belanja: <ShoppingBag className="w-4 h-4 text-blue-600" />,
  Makanan: <Utensils className="w-4 h-4 text-orange-600" />,
  Tagihan: <FileText className="w-4 h-4 text-purple-600" />,
};

interface Transaction {
  id: string;
  description: string;
  category: string;
  amount: number;
  type: string;
  date: string;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
  onRefresh: () => void;
}

export default function RecentTransactions({ transactions, onRefresh }: RecentTransactionsProps) {
  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus transaksi ini?')) return;

    try {
      const response = await fetch(`/api/transactions?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onRefresh(); // Refresh data setelah delete
      } else {
        alert('Gagal menghapus transaksi');
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Terjadi kesalahan saat menghapus transaksi');
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-800">Transaksi Terakhir</h3>
        <span className="text-sm text-slate-500">{transactions.length} transaksi</span>
      </div>
      
      <div className="space-y-2">
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p>Belum ada transaksi</p>
            <p className="text-sm mt-1">Mulai tambahkan transaksi pertamamu!</p>
          </div>
        ) : (
          transactions.slice(0, 5).map((tx) => (
            <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors group">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-full ${tx.type === "INCOME" ? "bg-emerald-50" : "bg-slate-100"}`}>
                  {categoryIcons[tx.category] || <FileText className="w-4 h-4 text-slate-500" />}
                </div>
                <div>
                  <p className="font-medium text-slate-800">{tx.description}</p>
                  <p className="text-xs text-slate-500">{tx.category} • {formatDate(tx.date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-1 font-semibold ${tx.type === "INCOME" ? "text-emerald-600" : "text-slate-800"}`}>
                  {tx.type === "INCOME" && <ArrowUpRight className="w-4 h-4" />}
                  {tx.type === "EXPENSE" && <ArrowDownRight className="w-4 h-4 text-rose-500" />}
                  {tx.type === "INCOME" ? "+" : "-"} {formatRupiah(tx.amount)}
                </div>
                <button
                  onClick={() => handleDelete(tx.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-rose-50 rounded-lg"
                  title="Hapus transaksi"
                >
                  <Trash2 className="w-4 h-4 text-rose-600" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
