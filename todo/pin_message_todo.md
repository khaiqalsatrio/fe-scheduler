# Daftar Tugas Semat Pesan (Pin Message)

- [x] Refaktor fungsi `handlePin` di `app/chat/[id].tsx`:
    - [x] Tambahkan logika toggle (Sematkan/Lepas Sematan).
    - [x] Integrasikan dengan API REST `PUT /v1/messages/{id}/pin`.
    - [x] Implementasi update optimistik di local state `messages`.
- [x] Tambahkan sinkronisasi WebSocket:
    - [x] Dengarkan event `message.pinned` untuk memperbarui status pesan secara real-time.
- [x] Implementasi UI Integrated Header (Gaya Final):
    - [x] Tampilan Full-width putih menyatu sempurna dengan header.
    - [x] Format satu baris ringkas: `Nama Pengirim: Konten Pesan`.
    - [x] Indikator badge kecil untuk multi-pin (hingga 3 pesan).
    - [x] Aksi "Jump to Message" & cycling sisa pesan saat bar diklik.
- [x] Pengujian: Berhasil menyematkan pesan dan tampilan sudah sesuai dengan referensi yang diinginkan (WA/Telegram Style).
