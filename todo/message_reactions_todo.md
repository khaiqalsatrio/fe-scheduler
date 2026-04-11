# Daftar Tugas Reaksi Pesan

- [x] Modifikasi `MessageBubble` untuk mendukung properti `reactions`.
- [x] Implementasi UI Reaksi di `MessageBubble`:
    - [x] Tampilkan chip emoji kecil di bawah pesan.
    - [x] Tambahkan gaya visual untuk membedakan reaksi dari "saya" dan orang lain.
- [x] Modifikasi `MessageActionMenu`:
    - [x] Tambahkan deretan emoji cepat (👍, ❤️, 😂, 😮, 😢, 🙏) di menu aksi.
    - [x] Tambahkan tombol "+" untuk akses cepat (diwakili emoji 🔥 untuk sementara).
- [x] Hubungkan UI ke logika Server/Socket di `app/chat/[id].tsx`:
    - [x] Buat fungsi `handleReact(emoji)`.
    - [x] Panggil API REST untuk menyimpan dan toggle reaksi.
- [x] Sinkronisasi Real-time:
    - [x] Dengarkan event Socket `message.reaction` untuk memperbarui gelembung pesan secara instan.
- [x] Pengujian: Berhasil tambah/hapus reaksi secara instan dan sinkron di kedua profil.
