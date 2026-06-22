# 🚀 Setup Turso Database

## Apa itu Turso?
Turso adalah **SQLite edge database** yang modern, cepat, dan gratis. Database ini sudah direplikasi ke banyak region di seluruh dunia untuk performa maksimal.

---

## 📦 Instalasi Turso CLI

### Windows (PowerShell):
```powershell
irm https://get.tur.so/install.ps1 | iex
```

### Mac/Linux:
```bash
curl -sSfL https://get.tur.so/install.sh | bash
```

### Atau pakai npm:
```bash
npm install -g @turso/cli
```

---

## 🔧 Setup Database (3 Langkah)

### 1. Login ke Turso
```bash
turso auth login
```
- Browser akan terbuka
- Login dengan GitHub/Email
- Kembali ke terminal

### 2. Buat Database
```bash
turso db create finance-dashboard
```
Output: `Created database finance-dashboard at...`

### 3. Ambil Credentials
```bash
# Ambil Database URL
turso db show finance-dashboard --url

# Ambil Auth Token
turso db tokens create finance-dashboard
```

---

## 📝 Update File .env

Copy credentials yang didapat ke `.env`:

```env
# Ganti dengan URL dan Token yang kamu dapat
TURSO_DATABASE_URL="libsql://finance-dashboard-[username].turso.io"
TURSO_AUTH_TOKEN="eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9..."
```

---

## 🗄️ Migrasi Database

Setelah update `.env`, jalankan:

```bash
# Generate Prisma Client
npx prisma generate

# Push schema ke Turso
npx prisma db push
```

---

## ✅ Test Koneksi

```bash
# Jalankan dev server
npm run dev
```

Buka `http://localhost:3000` dan:
1. Klik tombol **"+ Tambah Transaksi"**
2. Isi form transaksi
3. Klik **"Simpan"**
4. Transaksi akan tersimpan di Turso database!

---

## 🔍 Monitoring Database

### Lihat semua database:
```bash
turso db list
```

### Akses database via CLI:
```bash
turso db shell finance-dashboard
```

SQL commands yang bisa dicoba:
```sql
SELECT * FROM Transaction;
SELECT COUNT(*) FROM Transaction;
SELECT * FROM Transaction WHERE type = 'INCOME';
```

### Dashboard Web:
Kunjungi: https://turso.tech/app

---

## 💡 Development Mode (Tanpa Turso)

Jika belum setup Turso, aplikasi akan otomatis pakai **SQLite lokal** di `./prisma/dev.db`.

Cukup kosongkan atau comment variabel di `.env`:
```env
# TURSO_DATABASE_URL=""
# TURSO_AUTH_TOKEN=""
```

---

## 🎯 Production Deployment

### Deploy di Vercel:
1. Push ke GitHub
2. Import project di Vercel
3. Tambahkan Environment Variables:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
4. Deploy!

Database Turso sudah production-ready dengan:
- ✅ Auto-replication
- ✅ Global edge network
- ✅ Automatic backups
- ✅ 9GB storage gratis

---

## 📚 Resources

- [Turso Docs](https://docs.turso.tech/)
- [Turso + Prisma Guide](https://docs.turso.tech/sdk/ts/orm/prisma)
- [Dashboard Turso](https://turso.tech/app)

---

## 🆘 Troubleshooting

### "turso command not found"
Restart terminal setelah instalasi CLI.

### "Database connection failed"
Pastikan `TURSO_DATABASE_URL` dan `TURSO_AUTH_TOKEN` sudah benar di `.env`.

### "Error generating Prisma Client"
Jalankan: `npm install @prisma/client @libsql/client @prisma/adapter-libsql`

---

**Happy Coding! 🚀**
