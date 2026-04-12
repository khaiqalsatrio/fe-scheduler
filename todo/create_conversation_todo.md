# Todo: Implementasi Buat Percakapan Baru (DM & Grup)

- [x] Persiapan Layar Baru:
  - [x] Buat file `app/new-chat.tsx`.
- [x] List Pengguna & Pencarian:
  - [x] Implementasi fetching users dari `GET /v1/users/recipients`.
  - [x] Logika filter kategori.
- [x] Logika Pemilihan:
  - [x] State untuk menampung ID dan data User utuh.
  - [x] Toggle selection dengan penyimpanan data permanen (Fix bug lost data).
- [x] UI Konfigurasi Grup:
  - [x] Layar terpisah `app/create-group.tsx`.
  - [x] Review peserta yang dipilih.
- [x] Integrasi POST Conversations:
  - [x] Konstruksi `FormData`.
  - [x] Panggil API `POST /v1/conversations`.
- [x] Finalisasi & Navigasi:
  - [x] Redirect ke `app/chat/[id]`.
  - [x] FAB `chats.tsx` sudah terhubung.
