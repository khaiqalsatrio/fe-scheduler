# TODO: Fitur Sematkan Percakapan (Pin/Unpin)

- [ ] Persiapan Service
    - [ ] Implementasikan `pinConversation` & `pinConversations` di `chatService.ts`
- [ ] Komponen UI (`ChatItem.tsx`)
    - [ ] Tambahkan prop `isPinned` ke interface `ChatItemProps`
    - [ ] Render ikon **Pin** kecil di samping waktu pesan
- [ ] Integrasi Daftar Chat (`chats.tsx`)
    - [ ] Tambahkan ikon **Pin** di header mode seleksi (di samping ikon Mute)
    - [ ] Implementasikan logika untuk membedakan ikon (Pin vs PinOff) tergantung status chat yang dipilih
    - [ ] Perbarui logika pengurutan daftar chat agar chat yang dipin berada di paling atas
- [ ] Pengujian
    - [ ] Verifikasi chat berpindah ke posisi paling atas setelah dipin
    - [ ] Verifikasi ikon pin muncul pada baris chat
    - [ ] Verifikasi unpin mengembalikan chat ke posisi semula (berdasarkan waktu)
