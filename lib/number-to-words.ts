// Convert number to Indonesian words (for receipt)
// Example: 1759500 -> "SATU JUTA TUJUH RATUS LIMA PULUH SEMBILAN RIBU LIMA RATUS RUPIAH"

const satuan = ["", "SATU", "DUA", "TIGA", "EMPAT", "LIMA", "ENAM", "TUJUH", "DELAPAN", "SEMBILAN"];
const belasan = ["SEPULUH", "SEBELAS", "DUA BELAS", "TIGA BELAS", "EMPAT BELAS", "LIMA BELAS", "ENAM BELAS", "TUJUH BELAS", "DELAPAN BELAS", "SEMBILAN BELAS"];

function convertHundreds(num: number): string {
  let result = "";

  const ratusan = Math.floor(num / 100);
  const sisaRatusan = num % 100;

  if (ratusan > 0) {
    if (ratusan === 1) {
      result += "SERATUS ";
    } else {
      result += satuan[ratusan] + " RATUS ";
    }
  }

  if (sisaRatusan >= 10 && sisaRatusan < 20) {
    result += belasan[sisaRatusan - 10];
  } else {
    const puluhan = Math.floor(sisaRatusan / 10);
    const satuanDigit = sisaRatusan % 10;

    if (puluhan > 0) {
      result += satuan[puluhan] + " PULUH ";
    }

    if (satuanDigit > 0) {
      result += satuan[satuanDigit];
    }
  }

  return result.trim();
}

export function numberToWords(num: number): string {
  if (num === 0) return "NOL RUPIAH";

  // Remove decimals
  num = Math.floor(num);

  let result = "";

  // Milyar
  const milyar = Math.floor(num / 1000000000);
  if (milyar > 0) {
    result += convertHundreds(milyar) + " MILYAR ";
    num %= 1000000000;
  }

  // Juta
  const juta = Math.floor(num / 1000000);
  if (juta > 0) {
    if (juta === 1) {
      result += "SATU JUTA ";
    } else {
      result += convertHundreds(juta) + " JUTA ";
    }
    num %= 1000000;
  }

  // Ribu
  const ribu = Math.floor(num / 1000);
  if (ribu > 0) {
    if (ribu === 1) {
      result += "SERIBU ";
    } else {
      result += convertHundreds(ribu) + " RIBU ";
    }
    num %= 1000;
  }

  // Ratusan, puluhan, satuan
  if (num > 0) {
    result += convertHundreds(num) + " ";
  }

  return result.trim() + " RUPIAH";
}
