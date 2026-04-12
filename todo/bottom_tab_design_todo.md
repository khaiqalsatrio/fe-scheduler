# Daftar Tugas: Implementasi Desain Bottom Tab (DONE)

- [x] Persiapan `app/(tabs)/_layout.tsx`:
    - [x] Import `Tabs` dari `expo-router`.
    - [x] Import `MessageSquare` dan `Calendar` dari `lucide-react-native`.
- [x] Implementasi Gaya Kustom:
    - [x] Buat fungsi `TabIcon` yang menangani render ikon dan background kapsul (pill).
    - [x] Tambahkan `tabBarLabelStyle` dan `tabBarStyle` di `screenOptions`.
    - [x] Tambahkan logika `display: 'none'` untuk menyembunyikan tab di layar login.
- [x] Konfigurasi Tab:
    - [x] Atur tab **Chats** di sebelah Kiri.
    - [x] Atur tab **Agenda** dengan label "Itinerary" di sebelah Kanan.
    - [x] Nonaktifkan (sembunyikan) seluruh tab lainnya.
- [x] Verifikasi:
    - [x] Cek transisi antar tab (OK).
    - [x] Pastikan warna hijau (`#065F46`) dan indikator kapsul sesuai gambar (OK).
    - [x] Pastikan tab bar tidak muncul di halaman Login (OK).
