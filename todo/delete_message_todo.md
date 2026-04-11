# Daftar Tugas: Hapus Pesan

- [ ] Persiapan UI di `app/chat/[id].tsx`:
    - [ ] Buat state `isDeleteModalVisible` untuk konfirmasi hapus.
    - [ ] Implementasi Modal Konfirmasi dengan pilihan (Hapus untuk Saya / Hapus untuk Semua).
- [ ] Implementasi Logika Penghapusan:
    - [ ] Fungsi `handleDeleteLocal`: Memanggil `DELETE /v1/messages/{id}` (REST).
    - [ ] Fungsi `handleDeleteForEveryone`: Memanggil `socket.emit('message.delete', ...)` (WebSocket).
- [ ] Sinkronisasi Real-time:
    - [ ] Tambahkan socket listener untuk event `message.deleted`.
    - [ ] Hapus pesan dari state `messages` berdasarkan ID yang diterima dari broadcast.
- [ ] Refinement `MessageActionMenu`:
    - [ ] Pastikan menu Hapus memicu modal konfirmasi, bukan langsung menghapus.
- [ ] Pengujian:
    - [ ] Hapus pesan sendiri "untuk semua" dan pastikan hilang di perangkat lain.
    - [ ] Hapus pesan (sendiri atau orang lain) "untuk saya" dan pastikan hanya hilang di perangkat sendiri.
