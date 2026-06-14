import { ArrowUpRight, ArrowDownRight, ShoppingBag, Utensils, FileText, Briefcase } from "lucide-react";
import { formatRupiah, formatDate } from "@/lib/utils";

const categoryIcons: Record<string, any> = {
  Pendapatan: <Briefcase className="w-4 h-4 text-emerald-600" />,
  Belanja: <ShoppingBag className="w-4 h-4 text-blue-600" />,
  Makanan: <Utensils className="w-4 h-4 text-orange-600" />,
  Tagihan: <FileText className="w-4 h-4 text-purple-600" />,
};

export default function RecentTransactions({ transactions }: { transactions: any[] }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-800">Transaksi Terakhir</h3>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">Lihat Semua</button>
      </div>
      
      <div className="space-y-4">
        {transactions.map((tx) => (
          <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-full ${tx.type === "INCOME" ? "bg-emerald-50" : "bg-slate-100"}`}>
                {categoryIcons[tx.category] || <FileText className="w-4 h-4 text-slate-500" />}
              </div>
              <div>
                <p className="font-medium text-slate-800">{tx.description}</p>
                <p className="text-xs text-slate-500">{tx.category} • {formatDate(tx.date)}</p>
              </div>
            </div>
            <div className={`flex items-center gap-1 font-semibold ${tx.type === "INCOME" ? "text-emerald-600" : "text-slate-800"}`}>
              {tx.type === "INCOME" && <ArrowUpRight className="w-4 h-4" />}
              {tx.type === "EXPENSE" && <ArrowDownRight className="w-4 h-4 text-rose-500" />}
              {tx.type === "INCOME" ? "+" : "-"} {formatRupiah(tx.amount)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}