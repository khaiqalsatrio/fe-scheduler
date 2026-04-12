# Todo: Implementasi Fitur AI ChatAja

- [ ] Implementasi Socket Listener untuk AI Events:
    - [ ] Handle `ai.thinking` (Set thinking state per conversation)
    - [ ] Handle `ai.thinking.stop` (Unset thinking state)
- [ ] Implementasi UI Indikator AI:
    - [ ] Tambahkan animasi "AI sedang menyiapkan balasan..." di bawah daftar chat
- [ ] Fungsionalitas Tombol AI Menu:
    - [ ] **Tanya AI**: Integrasi pemicu pesan bantuan ke input/context
    - [ ] **Ringkas**: Kirim perintah `/summarize` otomatis ke AI Bot
    - [ ] **Buat Slide**: Kirim perintah `/presentation` otomatis ke AI Bot
- [ ] Fitur Group AI Integration:
    - [ ] Deteksi ketersediaan AI Bot di dalam grup
- [ ] Testing & Bug Fixing:
    - [ ] Verifikasi sinkronisasi event real-time
    - [ ] Cek konsistensi UI saat AI berhenti berpikir
