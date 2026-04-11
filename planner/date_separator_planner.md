# Perencanaan: Header Tanggal Chat (Date Separators)

Tujuan: Memberikan tanda pemisah tanggal di antara pesan chat agar pengguna tahu kapan pesan tersebut dikirim, serupa dengan gaya WhatsApp.

## Komponen Utama
1. **Logika Pengelompokan**:
   - Fungsi untuk memproses array `messages` dan menyisipkan objek "Pemisah Tanggal" setiap kali tanggal berubah di antara dua pesan.
   - Menggunakan `created_at` atau `time` sebagai basis perbandingan.
2. **Label Tanggal**:
   - Mendukung label cerdas: "Hari Ini" (Today), "Kemarin" (Yesterday), atau tanggal lengkap jika sudah lewat dari 2 hari.
3. **UI Separator**:
   - Komponen visual kecil yang berada di tengah layar chat dengan latar belakang semi-transparan atau warna abu-abu muda.
4. **Optimasi FlatList**:
   - Menangani tipe data gabungan (Pesan & Pemisah) di dalam `renderItem`.

## Strategi Implementasi
- Gunakan `useMemo` untuk menghitung `chatItems` dari `messages`.
- Tambahkan properti unik agar `keyExtractor` tetap berfungsi dengan baik.
