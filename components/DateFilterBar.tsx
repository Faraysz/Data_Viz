"use client";
import { useState, useEffect } from "react";
import { Calendar, CalendarDays, ChevronDown, RotateCcw, SlidersHorizontal, Check } from "lucide-react";

export type PeriodType = "ALL" | "TODAY" | "THIS_MONTH" | "THIS_YEAR" | "SPECIFIC_MONTH" | "CUSTOM";

export interface DateFilterValue {
  type: PeriodType;
  label: string;
  startDate: string | null;
  endDate: string | null;
}

interface DateFilterBarProps {
  value: DateFilterValue;
  onChange: (filter: DateFilterValue) => void;
}

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export default function DateFilterBar({ value, onChange }: DateFilterBarProps) {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // State untuk form internal
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [customStart, setCustomStart] = useState<string>("");
  const [customEnd, setCustomEnd] = useState<string>("");
  const [showMonthPicker, setShowMonthPicker] = useState<boolean>(false);
  const [showCustomPicker, setShowCustomPicker] = useState<boolean>(false);

  // Buat list opsi tahun (misal: 3 tahun terakhir s/d tahun depan)
  const availableYears = [
    currentYear - 2,
    currentYear - 1,
    currentYear,
    currentYear + 1,
  ];

  const handleSelectPreset = (type: PeriodType) => {
    const now = new Date();

    if (type === "ALL") {
      setShowMonthPicker(false);
      setShowCustomPicker(false);
      onChange({
        type: "ALL",
        label: "Semua Waktu",
        startDate: null,
        endDate: null,
      });
      return;
    }

    if (type === "TODAY") {
      setShowMonthPicker(false);
      setShowCustomPicker(false);
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      onChange({
        type: "TODAY",
        label: "Hari Ini",
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      });
      return;
    }

    if (type === "THIS_MONTH") {
      setShowMonthPicker(false);
      setShowCustomPicker(false);
      const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      onChange({
        type: "THIS_MONTH",
        label: `Bulan Ini (${MONTH_NAMES[now.getMonth()]})`,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      });
      return;
    }

    if (type === "THIS_YEAR") {
      setShowMonthPicker(false);
      setShowCustomPicker(false);
      const start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
      const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      onChange({
        type: "THIS_YEAR",
        label: `Tahun ${now.getFullYear()}`,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      });
      return;
    }

    if (type === "SPECIFIC_MONTH") {
      setShowMonthPicker(true);
      setShowCustomPicker(false);
      applySpecificMonth(selectedMonth, selectedYear);
      return;
    }

    if (type === "CUSTOM") {
      setShowCustomPicker(true);
      setShowMonthPicker(false);
      // Jangan langsung trigger onChange jika custom belum diisi, tunggu user klik tombol 'Terapkan'
    }
  };

  const applySpecificMonth = (monthIndex: number, yearNum: number) => {
    const start = new Date(yearNum, monthIndex, 1, 0, 0, 0, 0);
    const end = new Date(yearNum, monthIndex + 1, 0, 23, 59, 59, 999);
    onChange({
      type: "SPECIFIC_MONTH",
      label: `${MONTH_NAMES[monthIndex]} ${yearNum}`,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    });
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customStart || !customEnd) return;

    const start = new Date(customStart + "T00:00:00.000");
    const end = new Date(customEnd + "T23:59:59.999");

    const formatId = (d: Date) =>
      new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(d);

    onChange({
      type: "CUSTOM",
      label: `${formatId(start)} - ${formatId(end)}`,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    });
  };

  const handleReset = () => {
    setShowMonthPicker(false);
    setShowCustomPicker(false);
    setCustomStart("");
    setCustomEnd("");
    handleSelectPreset("ALL");
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-4">
      {/* Baris Tombol Preset */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-700">
          <CalendarDays className="w-5 h-5 text-blue-600 shrink-0" />
          <span className="text-sm font-semibold text-slate-800">Filter Periode:</span>
        </div>

        {/* Tombol-tombol Preset */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleSelectPreset("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
              value.type === "ALL"
                ? "bg-slate-900 text-white shadow-sm ring-1 ring-slate-900"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Semua Waktu
          </button>

          <button
            type="button"
            onClick={() => handleSelectPreset("TODAY")}
            className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
              value.type === "TODAY"
                ? "bg-blue-600 text-white shadow-sm ring-1 ring-blue-600"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Hari Ini
          </button>

          <button
            type="button"
            onClick={() => handleSelectPreset("THIS_MONTH")}
            className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
              value.type === "THIS_MONTH"
                ? "bg-blue-600 text-white shadow-sm ring-1 ring-blue-600"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Bulan Ini
          </button>

          <button
            type="button"
            onClick={() => handleSelectPreset("THIS_YEAR")}
            className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
              value.type === "THIS_YEAR"
                ? "bg-blue-600 text-white shadow-sm ring-1 ring-blue-600"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Tahun Ini
          </button>

          {/* Toggle Pilih Bulan */}
          <button
            type="button"
            onClick={() => handleSelectPreset("SPECIFIC_MONTH")}
            className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all flex items-center gap-1.5 ${
              value.type === "SPECIFIC_MONTH"
                ? "bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-600"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Pilih Bulan</span>
          </button>

          {/* Toggle Custom Date Range */}
          <button
            type="button"
            onClick={() => handleSelectPreset("CUSTOM")}
            className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all flex items-center gap-1.5 ${
              value.type === "CUSTOM"
                ? "bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-600"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Custom Tanggal</span>
          </button>

          {/* Tombol Reset jika filter aktif */}
          {value.type !== "ALL" && (
            <button
              type="button"
              onClick={handleReset}
              title="Reset ke Semua Waktu"
              className="px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg border border-red-200 font-medium transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Panel Form: Pilih Bulan Tertentu */}
      {showMonthPicker && (
        <div className="pt-3 border-t border-slate-100 bg-slate-50/70 p-3 rounded-lg flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
            Pilih Periode Bulan & Tahun:
          </span>
          <div className="flex items-center gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => {
                const m = parseInt(e.target.value);
                setSelectedMonth(m);
                applySpecificMonth(m, selectedYear);
              }}
              className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {MONTH_NAMES.map((m, idx) => (
                <option key={m} value={idx}>
                  {m}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => {
                const y = parseInt(e.target.value);
                setSelectedYear(y);
                applySpecificMonth(selectedMonth, y);
              }}
              className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>
          <span className="text-xs text-slate-500">
            (Pemasukan & pesanan akan otomatis disaring sesuai bulan yang dipilih)
          </span>
        </div>
      )}

      {/* Panel Form: Custom Tanggal (Date Range) */}
      {showCustomPicker && (
        <form
          onSubmit={handleApplyCustom}
          className="pt-3 border-t border-slate-100 bg-slate-50/70 p-3 rounded-lg flex flex-wrap items-center gap-3"
        >
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
            Rentang Tanggal Kustom:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <label className="text-xs text-slate-500 font-medium">Dari:</label>
              <input
                type="date"
                required
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <label className="text-xs text-slate-500 font-medium">Sampai:</label>
              <input
                type="date"
                required
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs md:text-sm font-medium px-4 py-1.5 rounded-lg transition-colors flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              Terapkan
            </button>
          </div>
        </form>
      )}

      {/* Status Filter Aktif Info */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
        <div>
          Periode yang aktif:{" "}
          <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
            {value.label}
          </span>
        </div>
        {value.type !== "ALL" && (
          <span className="text-slate-400">
            Statistik & data pesanan di bawah disesuaikan dengan periode ini.
          </span>
        )}
      </div>
    </div>
  );
}
