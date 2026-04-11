# Daftar Tugas Voice Note - SELESAI

- [x] Persiapkan `expo-av` dan cek konfigurasi di `app.json`.
- [x] Implementasi Perekaman Audio di `ChatInput.tsx`.
    - [x] Minta izin mikrofon.
    - [x] Tambahkan tombol/logika mulai rekam.
    - [x] Tambahkan timer yang sinkron (`setOnRecordingStatusUpdate`).
    - [x] Tambahkan logika stop & cancel rekam.
- [x] Integrasikan hasil rekaman dengan fungsi upload di `app/chat/[id].tsx`.
    - [x] Ubah format ekstensi menjadi `.mp3`.
    - [x] Perbaiki mapping riwayat pesan agar tetap terbaca sebagai Voice Note (bukan file).
- [x] Implementasi Pemutar Audio di `MessageBubble.tsx`.
    - [x] Deteksi tipe `voice` & `audio/mp3`.
    - [x] Desain ulang UI menjadi konsep WhatsApp Premium.
    - [x] Tambahkan tombol Play/Pause dan loading state.
    - [x] Tambahkan bar progres pemutaran.
    - [x] Pastikan audio berhenti setelah selesai dan bisa diputar ulang manual.
- [x] Pengujian (Recording & Playback).
- [x] Finalisasi Dokumentasi.
