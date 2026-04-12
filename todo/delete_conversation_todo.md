# TODO: Delete Conversation Feature (Completed)

- [x] **Persiapan & Analisis**
  - [x] Analisis dokumentasi API (DELETE /v1/conversations/:id).
  - [x] Menetapkan konsep WhatsApp (Multi-select).

- [x] **Pengembangan Komponen (ChatItem.tsx)**
  - [x] Tambahkan prop `isSelected` dan `onLongPress`.
  - [x] Implementasi styling `selectedContainer` (tint biru).
  - [x] Implementasi overlay centang pada avatar saat dipilih.
  - [x] Hapus tombol sampah individu dari dalam item.

- [x] **Pengembangan Layar Utama (chats.tsx)**
  - [x] Implementasi state `selectedChatIds` (Array).
  - [x] Implementasi `SelectionHeader` dinamis (Warna hijau gelap, Counter, Ikon Trash/Back).
  - [x] Implementasi logika toggle seleksi pada `handleChatPress` & `handleLongPress`.
  - [x] Implementasi Bulk Delete (perulangan pemanggilan API DELETE).
  - [x] Implementasi filter untuk menyembunyikan chat kosong (Hide-on-Delete).

- [x] **Verifikasi**
  - [x] Uji hapus satu chat.
  - [x] Uji hapus banyak chat sekaligus.
  - [x] Pastikan mode seleksi mati setelah penghapusan atau menekan tombol kembali.
  - [x] Pastikan chat yang dihapus benar-benar hilang dari daftar.
