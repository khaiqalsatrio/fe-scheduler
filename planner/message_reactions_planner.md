# Perencana Fitur Reaksi Pesan

## Deskripsi
Fitur ini memungkinkan pengguna untuk memberikan reaksi (emoji) pada setiap pesan di dalam percakapan. Pengguna bisa memilih dari set emoji populer, dan reaksi tersebut akan tersinkronisasi secara real-time ke semua peserta percakapan.

## Komponen Utama
1. **Layar Chat (`app/chat/[id].tsx`)**:
   - [x] Modifikasi `MessageBubble` untuk mendukung properti `reactions`.
   - [x] Implementasi UI Reaksi di `MessageBubble`:
       - [x] Tampilkan chip emoji kecil di bawah pesan.
       - [x] Tambahkan gaya visual untuk membedakan reaksi dari "saya" dan orang lain.
   - [x] Modifikasi `MessageActionMenu`:
       - [x] Tambahkan deretan emoji cepat (👍, ❤️, 😂, 😮, 😢, 🙏) di menu aksi.
       - [x] Tambahkan tombol "+" untuk akses cepat (diwakili emoji api untuk sementara).
   - [x] Hubungkan UI ke logika Server/Socket di `app/chat/[id].tsx`:
       - [x] Buat fungsi `handleReact(emoji)`.
       - [x] Panggil API REST untuk menyimpan dan toggle reaksi.
   - [x] Sinkronisasi Real-time:
       - [x] Dengarkan event Socket `message.reaction` untuk memperbarui gelembung pesan secara instan.
   - [x] Pengujian: Berhasil tambah/hapus reaksi secara instan dan sinkron di kedua profil.
2. **Komponen Reaksi (`components/MessageBubble.tsx` & `components/ReactionPicker.tsx`)**:
   - `ReactionPicker`: Menampilkan daftar emoji (👍, ❤️, 😂, 😮, 😢, 🙏).
   - Menampilkan chip reaksi kecil di gelembung pesan dengan jumlah jika ada lebih dari satu.
3. **Integrasi API & WebSocket**:
   - Menggunakan REST `POST /v1/messages/:id/reactions` untuk memberikan/menghapus reaksi.
   - Menggunakan WebSocket event `message.reaction` untuk sinkronisasi real-time antar pengguna.
4. **Optimistic UI**:
   - Memperbarui tampilan reaksi secara instan saat pengguna mengeklik emoji, lalu melakukan sinkronisasi dengan server di latar belakang.

## Referensi API
- REST: `POST /v1/messages/:id/reactions` (Body: `{ "emoji": "string" }`)
- WebSocket: `message.reaction` (Emit: `{ "messageId": "uuid", "emoji": "string" }`)
- WebSocket: `message.reaction` (Listen: Menerima objek reaksi dari server)

## Catatan Implementasi
- **Optimistic UI**: Reaksi langsung diperbarui di state lokal sebelum konfirmasi server untuk UX yang responsif.
- **Toggle Logic**: Menekan emoji yang sama akan menghapus reaksi (unreact), sementara menekan emoji berbeda akan mengganti reaksi user tersebut.
- **Real-time**: Mengintegrasikan socket listener agar reaksi dari pengguna lain langsung muncul tanpa refresh.
- **UI Bar**: Menambahkan barisan emoji cepat di atas menu aksi pesan.

