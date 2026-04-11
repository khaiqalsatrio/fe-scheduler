# Daftar Tugas Fitur Teruskan Pesan

- [x] Update `components/MessageActionMenu.tsx` untuk menyertakan opsi "Teruskan".
- [x] Update `app/chat/[id].tsx` untuk menangani navigasi saat "Teruskan" dipilih.
- [x] Buat file baru `app/forward-select.tsx`:
    - [x] Ambil daftar percakapan dari API.
    - [x] Implementasi UI pemilihan ganda (*multi-select*).
    - [x] Implementasi fungsi `handleForward` (panggil API `POST /messages/:id/forward`).
- [x] Tambahkan ikon `Forward` dari `lucide-react-native`.
- [x] Perbaikan Bug: Pastikan mapping ID menggunakan Server UUID untuk menghindari error "must be a UUID".
- [x] Verifikasi alur dari awal sampai pesan diterima di percakapan tujuan.
