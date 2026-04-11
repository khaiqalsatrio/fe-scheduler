# Perencana Fitur Teruskan Pesan (Forward)

## Deskripsi
Implementasi fitur untuk meneruskan pesan yang dipilih ke satu atau beberapa percakapan sekaligus. Fitur ini mencakup penambahan menu "Teruskan" pada pesan dan layar pemilihan kontak/percakapan.

## Alur Kerja (Workflow)
1. **Pemicu**: Pengguna menekan lama pesan -> Muncul menu aksi -> Pilih "Teruskan".
2. **Navigasi**: Aplikasi berpindah ke layar baru `forward-select` dengan membawa ID pesan yang akan diteruskan.
3. **Pemilihan**: Layar `forward-select` menampilkan daftar percakapan aktif dengan fitur *multi-select* (checkbox/selection).
4. **Eksekusi**: Pengguna menekan tombol "Kirim/Teruskan" -> Aplikasi memanggil API `POST /v1/messages/{id}/forward` dengan daftar `conversationIds`.
5. **Umpan Balik**: Tampilkan notifikasi sukses dan kembali ke layar chat sebelumnya.

## Komponen yang Terlibat
- **MessageActionMenu**: Menambahkan opsi "Teruskan".
- **ChatDetailScreen ([id].tsx)**: Menghubungkan menu ke aksi navigasi.
- **ForwardSelectScreen (Baru)**: Layar khusus untuk memilih daftar tujuan penerusan.

## Referensi API
- Endpoint: `POST /v1/messages/{id}/forward`
- Payload: `{ "conversationIds": ["uuid1", "uuid2", ...] }`

## Catatan Teknis Penting (Fix)
- **ID Identifikasi**: Memastikan mapping pesan selalu memprioritaskan database UUID (`id`) daripada `client_message_id` agar fitur Forward dan Reply tidak ditolak oleh server dengan error "must be a UUID".

