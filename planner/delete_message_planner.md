# Perencanaan Fitur Hapus Pesan

Tujuan: Memungkinkan pengguna untuk menghapus pesan dari percakapan, baik untuk diri sendiri maupun untuk semua orang.

## Komponen Utama
1. **Pemicu UI**:
   - Menambahkan opsi "Hapus" pada menu konteks pesan (tekan lama pada pesan).
2. **Dialog Konfirmasi**:
   - Menampilkan dialog konfirmasi dengan dua pilihan:
     - **Hapus untuk saya**: Hanya menghapus pesan di sisi pengguna saat ini (menggunakan API REST `DELETE`).
     - **Hapus untuk semua orang**: Menghapus pesan untuk semua peserta (hanya jika pengguna adalah pengirim pesan, menggunakan WebSocket `message.delete`).
3. **Integrasi API & Socket**:
   - **REST**: `DELETE /v1/messages/{id}` untuk penghapusan lokal.
   - **WebSocket Command**: `message.delete` dengan payload `{ "messageId": "uuid", "forEveryone": true }`.
   - **WebSocket Broadcast**: Mendengarkan `message.deleted` untuk menghapus pesan dari state UI secara real-time.
4. **Update UI**:
   - Pesan yang dihapus akan segera hilang dari daftar `messages`.

## Alur Kerja
1. Pengguna memilih "Hapus" dari menu aksi.
2. Muncul modal konfirmasi (Check `isMine` untuk menentukan apakah opsi "Hapus untuk semua" muncul).
3. Jika "Hapus untuk saya":
   - Panggil API REST `DELETE`.
   - Update state `messages` lokal secara optimistik.
4. Jika "Hapus untuk semua":
   - Kirim socket emit `message.delete`.
   - Update state `messages` lokal saat menerima ACK atau broadcast.
5. Pesan dihapus dari FlatList.
