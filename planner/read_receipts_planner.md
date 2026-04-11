# Perencana Fitur Laporan Baca (Read Receipts - Centang Biru)

## Deskripsi
Implementasi sinkronisasi status "dibaca" (centang biru) secara otomatis saat pengguna membuka percakapan. Ini memastikan bahwa pengirim pesan tahu bahwa pesannya telah dibaca oleh kita.

## Komponen Utama
1. **Sinkronisasi REST (Initial Sync)**:
   - Memanggil `PUT /v1/messages/read` segera setelah memasuki layar chat.
   - Ini menandai semua pesan lama di percakapan tersebut sebagai "Selesai dibaca".
2. **Sinkronisasi Real-time (WebSocket)**:
   - Memastikan event `message.read` terkirim saat ada pesan baru yang masuk dan layar sedang fokus. (Sudah ada sebagian, perlu dioptimalkan).
   - Menangani event `message.read` dari server untuk memperbarui centang menjadi biru pada pesan yang kita kirim.
3. **Penyelarasan UI**:
   - Memastikan `MessageBubble.tsx` menggunakan status `read` untuk menampilkan dua centang berwarna biru (#34B7F1).

## Referensi API
- REST: `PUT /v1/messages/read` -> `{ "conversationId": "uuid" }`
- WebSocket: Emit `message.read` -> `{ "conversationId": "uuid", "lastMessageId": "uuid" }`
