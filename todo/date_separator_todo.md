# Daftar Tugas: Header Tanggal Chat

- [x] Buat fungsi utilitas `getDateLabel(dateString)`:
    - [x] Mendukung "Hari Ini", "Kemarin", dan "dd MMMM yyyy".
- [x] Implementasikan transformasi data di `app/chat/[id].tsx`:
    - [x] Sisipkan item pemisah tanggal ke dalam array data untuk FlatList menggunakan `useMemo`.
- [x] Update `renderItem` di FlatList:
    - [x] Tambahkan pengecekan jika item adalah `isDateSeparator`.
    - [x] Buat komponen visual `DateSeparator` dengan gaya kapsul.
- [x] Styling:
    - [x] Tampilan bersih, berada di tengah, dengan font abu-abu gelap dan latar kapsul transparan halus.
- [x] Verifikasi:
    - [x] Berhasil memisahkan pesan harian dan tetap lancar saat pagination.
