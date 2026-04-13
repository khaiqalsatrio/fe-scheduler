# Planner: Implementasi Fitur Arsipkan Percakapan

Fitur ini memungkinkan pengguna untuk menyembunyikan percakapan dari daftar utama dengan memindahkannya ke folder "Diarsipkan".

## Rencana Implementasi

### 1. Service Layer (`services/chatService.ts`)
- Menambahkan fungsi `archiveConversation(id: string, isArchived: boolean)` yang memanggil `PUT /v1/conversations/{id}/archive`.
- Menambahkan fungsi `archiveConversations(ids: string[], isArchived: boolean)` untuk aksi massal.
- Memperbarui `getConversations` untuk mengirim `?includeArchived=true` agar data sinkron antara daftar utama dan folder arsip.
- Memastikan tipe `ChatListItem` memiliki properti `isArchived`.

### 2. State & Hooks Layer (`hooks/useChatMessages.ts`)
- Menambahkan listener WebSocket `conversation.archived` untuk sinkronisasi real-time.
- Memperbarui state percakapan saat status arsip berubah.

### 3. UI Layer (Daftar Chat - `app/(tabs)/chats.tsx`)
- Menambahkan ikon **Archive** (Box) di header mode seleksi.
- Mengimplementasikan logika pemindahan chat: jika diarsipkan, chat hilang dari daftar utama.
- Menampilkan entri "Arsip" di bagian atas daftar chat jika terdapat percakapan yang diarsipkan.
- Membuat layar baru atau modal untuk melihat daftar "Chat yang Diarsipkan".

### 4. UI Layer (Detail Chat - `app/chat/[id].tsx`)
- Menambahkan opsi "Arsipkan Chat" di menu titik tiga.

## Referensi API
- `PUT /v1/conversations/{id}/archive`
- Body: `{"isArchived": boolean}`
- WebSocket: `conversation.archive` & `conversation.archived`.
