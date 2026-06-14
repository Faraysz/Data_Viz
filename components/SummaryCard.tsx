import { ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react";
import { formatRupiah } from "@/lib/utils";

interface SummaryCardProps {
  title: string;
  amount: number;
  type: "balance" | "income" | "expense";
}

export default function SummaryCard({ title, amount, type }: SummaryCardProps) {
  const isIncome = type === "income";
  const isExpense = type === "expense";

  const iconMap = {
    balance: <Wallet className="w-5 h-5 text-blue-600" />,
    income: <ArrowUpRight className="w-5 h-5 text-emerald-600" />,
    expense: <ArrowDownRight className="w-5 h-5 text-rose-600" />,
  };

  const bgMap = {
    balance: "bg-blue-50",
    income: "bg-emerald-50",
    expense: "bg-rose-50",
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-500">{title}</h3>
        <div className={`p-2 rounded-lg ${bgMap[type]}`}>
          {iconMap[type]}
        </div>
      </div>
      <p className={`text-2xl font-bold ${isIncome ? "text-emerald-600" : isExpense ? "text-rose-600" : "text-slate-900"}`}>
        {formatRupiah(amount)}
      </p>
    </div>
  );
}