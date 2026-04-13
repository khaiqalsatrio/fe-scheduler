# TODO: Fitur Arsipkan Percakapan

- [x] Persiapan Model & Service
    - [x] Tambahkan `isArchived` ke `ChatListItem` di `types/chat.ts`
    - [x] Implementasikan `archiveConversation` & `archiveConversations` di `chatService.ts`
    - [x] Update `getConversations` untuk memetakan field `is_archived` dan parameter `includeArchived=true`
- [x] Pengelolaan State & Sinkronisasi
    - [x] Tambahkan listener socket `conversation.archived` di `hooks/useChatMessages.ts` (terintegrasi via fetch)
- [x] Integrasi UI Daftar Chat (`chats.tsx`)
    - [x] Tambahkan ikon **Archive** (Box) di header mode seleksi (di samping ikon Mute).
    - [x] Implementasikan animasi pemindahan chat saat diarsipkan.
    - [x] Buat UI entri "Arsip" di bagian paling atas daftar chat sesuai desain WhatsApp.
- [x] Navigasi Arsip
    - [x] Buat layar `app/archived.tsx` untuk menampilkan daftar chat yang diarsipkan.
    - [x] Berikan kemampuan untuk "Buka Arsip" (Unarchive) dari layar tersebut.
- [x] Pengujian
    - [x] Verifikasi chat hilang dari daftar utama setelah diarsipkan.
    - [x] Verifikasi chat muncul di folder Arsip.
    - [x] Verifikasi unarchive mengembalikan chat ke daftar utama.
