# TODO: Fitur Detail Grup

- [ ] Pengembangan API Service
    - [ ] Implementasikan `getGroupMembers` di `chatService.ts`
    - [ ] Implementasikan `updateGroupInfo` di `chatService.ts`
    - [ ] Implementasikan `addMember` & `removeMember` di `chatService.ts`
- [ ] Implementasi UI Detail Grup (`app/group-detail/[id].tsx`)
    - [ ] Bangun layout header (Avatar, Nama, Ikon Edit) sesuai desain
    - [ ] Render daftar anggota grup dengan komponen `MemberItem` (kustom)
    - [ ] Tambahkan logika perubahan nama grup (Modal Input)
- [ ] Integrasi Navigasi
    - [ ] Update header di `app/chat/[id].tsx` agar judul grup bisa diklik
    - [ ] Kirim data grup saat navigasi ke halaman detail
- [ ] Pengujian
    - [ ] Verifikasi navigasi dari chat ke detail grup berhasil
    - [ ] Verifikasi daftar anggota muncul dengan benar (sesuai API)
    - [ ] Verifikasi perubahan nama grup tersimpan (Admin only test)
