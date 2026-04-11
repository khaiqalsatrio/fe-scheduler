# Perencanaan Fitur Edit Pesan

Tujuan: Memungkinkan pengguna untuk memperbarui isi pesan teks yang sudah dikirim.

## Komponen Utama
1. **Pemicu UI**:
   - Menambahkan opsi "Edit" pada menu konteks pesan (tekan lama pada pesan).
   - Hanya pesan milik sendiri (`isMine: true`) yang bisa diedit.
   - **Batas Waktu**: Hanya bisa diedit dalam kurun waktu **15 menit** setelah pengiriman (WhatsApp style).
   - Hanya tipe pesan `text` yang didukung untuk edit.
2. **Mode Edit**:
   - Saat "Edit" dipilih, input chat akan berubah menjadi mode edit (menampilkan teks asli).
   - Menambahkan indikator (misal: tombol silang atau label "Edit Pesan") di atas input chat untuk membatalkan edit.
3. **Integrasi API & Socket**:
   - **REST**: `PUT /v1/messages/{id}` untuk pengiriman update.
   - **WebSocket Command**: `message.edit` (opsional jika ingin full socket).
   - **WebSocket Broadcast**: Mendengarkan `message.updated` untuk memperbarui UI secara real-time bagi semua peserta.
4. **Indikator "Diedit"**:
   - Menambahkan label "(diedit)" kecil di samping waktu pesan pada bubble chat jika pesan telah diubah.

## Alur Kerja
1. Pengguna memilih "Edit" dari menu aksi.
2. State `editingMessage` diatur di `app/chat/[id].tsx`.
3. Komponen `ChatInput` mendeteksi mode edit dan mengisi teks.
4. Pengguna menekan tombol kirim -> Memanggil `handleUpdate`.
5. Update optimistik dilakukan di UI.
6. Notifikasi real-time memperbarui pesan di perangkat lain.
