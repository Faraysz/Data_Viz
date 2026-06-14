export const mockSummary = {
  balance: 12500000,
  income: 8500000,
  expense: 3200000,
};

export const mockChartData = [
  { name: "Jan", income: 4000000, expense: 2400000 },
  { name: "Feb", income: 3000000, expense: 1398000 },
  { name: "Mar", income: 2000000, expense: 9800000 },
  { name: "Apr", income: 2780000, expense: 3908000 },
  { name: "Mei", income: 1890000, expense: 4800000 },
  { name: "Jun", income: 8500000, expense: 3200000 },
];

export const mockTransactions = [
  { id: "1", description: "Gaji Bulanan", category: "Pendapatan", amount: 8500000, type: "INCOME", date: new Date("2023-10-25") },
  { id: "2", description: "Belanja Bulanan Hypermart", category: "Belanja", amount: 1200000, type: "EXPENSE", date: new Date("2023-10-24") },
  { id: "3", description: "GoFood Makan Siang", category: "Makanan", amount: 45000, type: "EXPENSE", date: new Date("2023-10-24") },
  { id: "4", description: "Bayar Listrik & Internet", category: "Tagihan", amount: 350000, type: "EXPENSE", date: new Date("2023-10-22") },
  { id: "5", description: "Freelance Desain Logo", category: "Pendapatan", amount: 1500000, type: "INCOME", date: new Date("2023-10-20") },
];