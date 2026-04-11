# Daftar Tugas Cari Pesan Lokal (Dalam Chat)

- [ ] Tambahkan state `isSearchingLocal`, `localSearchQuery`, dan `localSearchResults` di `app/chat/[id].tsx`.
- [ ] Modifikasi Header:
    - [ ] Tambahkan ikon `Search` di sebelah ikon menu.
    - [ ] Buat logika transisi header menjadi kolom input pencarian saat aktif.
- [ ] Implementasi fungsi `handleLocalSearch` yang memanggil `GET /v1/messages/search/:id`.
- [ ] Pasang *debounce* pada input pencarian lokal.
- [ ] Tampilan Hasil:
    - [ ] Tampilkan daftar pesan yang cocok saat pencarian aktif.
    - [ ] Tombol 'Batal' atau 'X' untuk keluar dari mode pencarian.
- [ ] Pengujian: Cari kata kunci di satu chat, pastikan hanya pesan dari chat tersebut yang muncul.
