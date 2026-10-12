# 🗄️ Panduan Setup & Pengoperasian Database
**PostgreSQL & Prisma ORM**

---

## 1. ⚙️ Konfigurasi Koneksi Database

Database yang digunakan pada proyek ini adalah **PostgreSQL 17** yang berjalan secara lokal.

Konfigurasi koneksi tersimpan di file [`.env`](file:///d:/Projects/Codings/finance-dashboard/.env):

```env
DATABASE_URL="postgresql://postgres:1952@localhost:5432/finance_db"
```

### Parameter Koneksi:
| Komponen | Nilai Default | Keterangan |
| :--- | :--- | :--- |
| **User** | `postgres` | Superuser PostgreSQL |
| **Password** | `1952` | Password akun postgres lokal |
| **Host** | `localhost` | Server lokal |
| **Port** | `5432` | Port standar PostgreSQL |
| **Database** | `finance_db` | Nama database untuk aplikasi ini |

---

## 2. 🧱 Struktur Tabel & Skema ([`prisma/schema.prisma`](file:///d:/Projects/Codings/finance-dashboard/prisma/schema.prisma))

```mermaid
erDiagram
    Customer ||--o{ Order : "places"
    Order ||--o{ Payment : "has"

    Customer {
        String id PK
        String name
        String phone
        String email
        String address
        String notes
        DateTime createdAt
    }

    Order {
        String id PK
        String orderNumber UK
        String customerId FK
        String description
        Int quantity
        String unit
        Decimal pricePerUnit
        Decimal totalPrice
        OrderStatus status
        DateTime orderDate
        DateTime dueDate
    }

    Payment {
        String id PK
        String receiptNumber UK
        String orderId FK
        Decimal amount
        PaymentType paymentType
        String paymentMethod
        DateTime paymentDate
        String receivedBy
    }
```

### Deskripsi Tabel:
1. **`Customer`**: Menyimpan data kontak & identitas pelanggan.
2. **`Order`**: Menyimpan pesanan konveksi dengan status:
   - `PENDING` ➔ Pesanan baru diterima.
   - `PRODUCTION` ➔ Sedang dalam pengerjaan konveksi.
   - `READY` ➔ Selesai dikerjakan & siap diambil.
   - `COMPLETED` ➔ Sudah lunas & diserahkan ke pelanggan.
   - `CANCELLED` ➔ Dibatalkan.
3. **`Payment`**: Menyimpan bukti pembayaran:
   - `DP` ➔ Uang muka saat pemesanan.
   - `CICILAN` ➔ Pembayaran bertahap saat produksi.
   - `PELUNASAN` ➔ Pembayaran sisa tagihan.

---

## 3. 🛠️ Perintah Pengoperasian Database (CLI)

Jalankan perintah-perintah berikut di terminal proyek:

### A. Membuka GUI Prisma Studio (Browser)
Cara paling praktis untuk melihat, menambah, atau mengedit data tanpa SQL:
```powershell
npm run db:studio
```
> Akses melalui browser di: **`http://localhost:5555`**

---

### B. Mengisi Ulang Data Sampel (Seeding)
Jika database kosong atau ingin mereset data contoh:
```powershell
npm run db:seed
```
*Script ini akan membuat contoh customer, order lanyard/kaos, dan riwayat pembayarannya.*

---

### C. Menjalankan Migrasi Skema Baru
Jika kamu mengubah file [`prisma/schema.prisma`](file:///d:/Projects/Codings/finance-dashboard/prisma/schema.prisma):
```powershell
npx prisma migrate dev --name <nama_perubahan>
```

---

### D. Memeriksa Status Migrasi
```powershell
npx prisma migrate status
```

---

## 4. 🐘 Pengoperasian Lewat pgAdmin 4

Database `finance_db` sudah terhubung langsung di **pgAdmin 4**. Berikut panduan navigasinya:

### A. Melihat Lokasi Tabel
Di PostgreSQL, tabel tidak langsung berada di bawah nama database, melainkan di dalam schema `public`:
1. Di panel kiri, buka: **Servers** ➔ **PostgreSQL 17** ➔ **Databases**.
2. Klik database **`finance_db`**.
3. Buka folder: **Schemas** ➔ **public** ➔ **Tables**.
4. Di sana kamu akan menemukan tabel:
   - `Customer`
   - `Order`
   - `Payment`
   - `_prisma_migrations`

---

### B. Melihat & Mengedit Data secara Visual (Tanpa Coding)
1. **Klik kanan** pada salah satu tabel (misal: `Order`).
2. Pilih menu **View/Edit Data** ➔ **All Rows**.
3. Data akan ditampilkan dalam format tabel grid. Kamu bisa langsung mengedit sel data atau menambahkan baris baru, lalu klik ikon **Save Data Changes (F6)**.

---

### C. Menjalankan Query SQL Manual
1. Klik pada database **`finance_db`**.
2. Buka **Query Tool** (ikon petir/terminal atau tekan menu `Tools` ➔ `Query Tool`).
3. Tulis query SQL (ingat gunakan tanda kutip dua `""` untuk tabel Prisma):

```sql
-- Melihat semua pelanggan
SELECT * FROM "Customer" ORDER BY "createdAt" DESC;

-- Melihat pesanan beserta informasi pelanggan
SELECT 
    o."orderNumber",
    c."name" AS "customerName",
    o."description",
    o."quantity",
    o."totalPrice",
    o."status"
FROM "Order" o
JOIN "Customer" c ON o."customerId" = c."id";

-- Melihat riwayat pembayaran dan kwitansi
SELECT 
    p."receiptNumber",
    p."paymentType",
    p."amount",
    p."paymentMethod",
    p."paymentDate"
FROM "Payment" p
ORDER BY p."paymentDate" DESC;
```
4. Tekan **F5** atau tombol **Execute** (segitiga) untuk melihat hasilnya.

---

## 5. 💡 Troubleshooting & Masalah Umum

1. **Error: Database connection refused (ECONNREFUSED)**
   - Pastikan service PostgreSQL di Windows sedang berjalan:
     ```powershell
     Get-Service -Name *postgres*
     ```
   - Jika `Stopped`, jalankan dengan:
     ```powershell
     Start-Service postgresql-x64-17
     ```

2. **Lupa Password PostgreSQL:**
   - Password saat ini terkonfigurasi pada nilai `1952`. Jika diubah di pgAdmin / installer PostgreSQL, sesuaikan juga variabel `DATABASE_URL` di file [`.env`](file:///d:/Projects/Codings/finance-dashboard/.env).
