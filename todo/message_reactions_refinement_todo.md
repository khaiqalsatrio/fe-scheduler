# Daftar Tugas Penyempurnaan Reaksi & Emoji Picker

- [x] Pastikan logika `handleReact` sudah benar dalam menangani toggle-off (hapus jika klik emoji yang sama).
- [x] Buat komponen baru `components/EmojiPicker.tsx` (Grid emoji dalam Bottom Sheet Modal).
- [x] Modifikasi `components/MessageActionMenu.tsx`:
    - [x] Tambahkan state `isEmojiPickerVisible`.
    - [x] Ubah aksi tombol "+" untuk membuka `EmojiPicker`.
    - [x] Render `EmojiPicker` sebagai Bottom Sheet di atas menu.
- [x] Hubungkan pilihan emoji dari `EmojiPicker` ke fungsi `onReact`.
- [x] Pengujian: Berhasil hapus reaksi dengan sekali klik dan memilih ribuan emoji lewat Bottom Sheet.
