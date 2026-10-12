import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

/**
 * Membersihkan spasi berlebih, spasi unicode (non-breaking spaces),
 * indentasi tab, dan baris kosong ganda yang sering terbawa saat copy-paste dari LLM/web.
 */
export function cleanText(text: string, isMultiline = false): string {
  if (!text) return "";
  // Ganti non-breaking space dan unicode invisible whitespace dengan spasi normal
  let cleaned = text.replace(/[\u00A0\u1680\u180e\u2000-\u200b\u202f\u205f\u3000\ufeff]/g, " ");

  if (isMultiline) {
    return cleaned
      .split("\n")
      .map((line) => line.replace(/[ \t]+/g, " ").trim())
      .filter((line, idx, arr) => !(line === "" && arr[idx - 1] === "")) // cegah baris kosong bertumpuk
      .join("\n")
      .trim();
  } else {
    // Single-line (ganti baris baru/tab menjadi spasi tunggal, hapus spasi beruntun & trim)
    return cleaned.replace(/[\r\n\t]+/g, " ").replace(/\s{2,}/g, " ").trim();
  }
}