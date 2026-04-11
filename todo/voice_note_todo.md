# Daftar Tugas Voice Note

- [ ] Persiapkan `expo-av` dan cek konfigurasi di `app.json`.
- [ ] Implementasi Perekaman Audio di `ChatInput.tsx`.
    - [ ] Minta izin mikrofon.
    - [ ] Tambahkan tombol/logika mulai rekam.
    - [ ] Tambahkan timer/umpan balik visual.
    - [ ] Tambahkan logika stop & cancel rekam.
- [ ] Integrasikan hasil rekaman dengan fungsi upload di `app/chat/[id].tsx`.
- [ ] Implementasi Pemutar Audio di `MessageBubble.tsx`.
    - [ ] Deteksi tipe `voice`.
    - [ ] Tambahkan tombol Play/Pause dan loading state.
    - [ ] Tambahkan bar progres pemutaran.
- [ ] Penyesuaian `fetchMessages` untuk memuat status audio.
- [ ] Pengujian (Recording & Playback).
