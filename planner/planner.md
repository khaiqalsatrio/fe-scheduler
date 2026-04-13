# Fitur: Reset Chat (Hapus & Buat Ulang)

## Deskripsi
Fitur ini memungkinkan pengguna untuk menghapus seluruh riwayat pesan dalam sebuah percakapan dan segera memulai percakapan baru dengan partisipan yang sama. ID percakapan akan berubah setelah proses ini berhasil.

## Spesifikasi API
- **Endpoint**: `DELETE /v1/conversations/{id}`
- **Metode**: `DELETE`
- **Output**: Objek `Conversation` baru.
- **WebSocket Event**: `conversation.deleted`
    - Payload: `{ "conversationId": "uuid_lama", "replacedByConversationId": "uuid_baru" }`

## Alur Kerja
1. Pengguna membuka menu di pojok kanan atas layar Chat Detail.
2. Pengguna memilih "Reset Percakapan".
3. Sistem memunculkan konfirmasi dialog.
4. Jika setuju, panggil `ChatService.deleteConversation(id)`.
5. Navigasi otomatis ke ID chat yang baru.
6. Subscriber WebSocket lainnya akan menerima event `conversation.deleted` dan juga melakukan redirect.

## Risiko & Mitigasi
- **Data Loss**: Penghapusan ini bersifat fisik dan permanen. Konfirmasi Alert sangat penting.
- **Race Condition**: Pastikan navigasi dilakukan setelah respons sukses diterima.
