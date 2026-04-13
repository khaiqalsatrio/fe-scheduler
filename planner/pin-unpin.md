# Planner: Fitur Sematkan Percakapan (Pin/Unpin)

Fitur ini memungkinkan pengguna untuk menyematkan percakapan penting agar selalu berada di posisi paling atas daftar chat.

## Rencana Implementasi

### 1. Service Layer (`services/chatService.ts`)
- Menambahkan fungsi `pinConversation(id: string, isPinned: boolean)` yang memanggil `PUT /v1/conversations/{id}/pin`.
- Menambahkan fungsi `pinConversations(ids: string[], isPinned: boolean)` untuk aksi massal di mode seleksi.

### 2. UI Layer (Daftar Chat - `app/(tabs)/chats.tsx`)
- Menambahkan ikon **Pin** (Pin) di header mode seleksi (di samping ikon Mute dan Archive).
- Mengimplementasikan logika pengurutan: Chat yang disematkan (`isPinned: true`) harus selalu muncul paling atas, kemudian diurutkan berdasarkan waktu pesan terakhir.
- Membatasi jumlah chat yang bisa disematkan (opsional, mengikuti standar WhatsApp biasanya maksimal 3).

### 3. Komponen Item Chat (`components/ChatItem.tsx`)
- Memperbarui komponen `ChatItem` untuk menerima prop `isPinned`.
- Menampilkan ikon pin kecil di area waktu atau footer chat jika statusnya tersemat.

## Referensi API
- `PUT /v1/conversations/{id}/pin`
- Body: `{"isPinned": boolean}`
- WebSocket: `conversation.pin` & `conversation.pinned`.
