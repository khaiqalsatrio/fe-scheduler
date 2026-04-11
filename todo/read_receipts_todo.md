# Daftar Tugas Laporan Baca (Read Receipts)

- [ ] Implementasi fungsi `markAsRead` di `app/chat/[id].tsx`.
    - [ ] Gunakan API REST `PUT /v1/messages/read`.
    - [ ] Panggil fungsi ini di dalam `fetchMessages` atau `useEffect` awal.
- [ ] Optimasi penangan WebSocket untuk status baca:
    - [ ] Pastikan saat menerima `message.new`, kita membalas dengan `message.read` (Sudah ada di kode).
    - [ ] Pastikan kita mendengarkan `message.read` dari orang lain untuk memperbarui centang biru di HP kita (Sudah ada di kode).
- [ ] Verifikasi tampilan centang biru pada `MessageBubble`.
- [ ] Pengujian: Buka chat, kirim pesan dari akun lain, periksa apakah centang berubah menjadi biru secara otomatis.
