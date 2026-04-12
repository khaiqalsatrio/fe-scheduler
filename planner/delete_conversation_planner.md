# Implementation Plan - WhatsApp-Style Deletion Feature (Final)

Tujuan: Mengimplementasikan fitur hapus percakapan dengan antarmuka yang bersih dan fungsional mengikuti standar WhatsApp.

## 1. Analisis API
- **Endpoint**: `DELETE /v1/conversations/:id`
- **Fungsi**: Menghapus riwayat pesan dan record percakapan. Server akan melakukan "recreate" room sehingga ID percakapan berubah namun peserta tetap sama.

## 2. Strategi UI/UX (WhatsApp Style)
- **Multi-Selection Mode**: Pengguna dapat memilih satu atau lebih chat sekaligus dengan menahan (long-press) item chat.
- **Dynamic Action Header**: Header utama aplikasi berubah menjadi bar aksi hijau gelap saat mode seleksi aktif. Menampilkan jumlah pilihan dan ikon sampah untuk hapus masal.
- **Visual Feedback**:
  - Tint warna latar belakang pada chat yang dipilih.
  - Overlay centang pada avatar chat yang dipilih.
- **Logic Hide-on-Delete**: Mengimplementasikan filter frontend agar percakapan yang dikosongkan (dikirim/di-reset oleh server) tidak muncul di daftar chat sampai ada pesan baru.

## 3. Komponen yang Diubah
- `components/ChatItem.tsx`: Menghapus tombol sampah internal, menambahkan prop `isSelected` dan `onLongPress`.
- `app/(tabs)/chats.tsx`: Menambahkan state `selectedChatIds`, implementasi `handleDeleteConversation` (bulk loop), dan header dinamis.
