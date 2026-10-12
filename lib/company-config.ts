// Company Information for Receipt/Invoice
export const COMPANY_INFO = {
  name: "CV. AKSARA INOVATIF",
  address: "Dsn Gumuk Bago, Desa Nogosari, Kec Rambipuji",
  phone: "No tlp 08131355613",
  logo: "/logo.png", // Path to company logo

  // Bank accounts for transfer
  banks: [
    {
      id: "bca",
      name: "BCA",
      accountNumber: "333771177",
      accountName: "A.N Firzy Afriyan",
    },
    // Add more banks here if needed
    // {
    //   id: "bri",
    //   name: "BRI",
    //   accountNumber: "123456789",
    //   accountName: "A.N Firzy Afriyan",
    // },
  ],

  // Default receiver name for receipts
  defaultReceiverName: "Firzy Afriyan",
};

// Unit options for products
export const UNIT_OPTIONS = [
  { value: "pcs", label: "Pcs" },
  { value: "lusin", label: "Lusin" },
  { value: "kodi", label: "Kodi" },
  { value: "meter", label: "Meter" },
  { value: "roll", label: "Roll" },
];

// Order status labels
export const ORDER_STATUS_LABELS = {
  PENDING: "Menunggu",
  PRODUCTION: "Produksi",
  READY: "Siap Diambil",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};

// Payment type labels
export const PAYMENT_TYPE_LABELS = {
  DP: "DP (Down Payment)",
  CICILAN: "Cicilan",
  PELUNASAN: "Pelunasan",
};

// Status colors for UI
export const STATUS_COLORS = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PRODUCTION: "bg-blue-100 text-blue-800",
  READY: "bg-green-100 text-green-800",
  COMPLETED: "bg-slate-100 text-slate-800",
  CANCELLED: "bg-red-100 text-red-800",
};
