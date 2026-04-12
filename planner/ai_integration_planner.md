# Planner: Integrasi Fitur AI (Tanya AI, Ringkas, Buat Slide)

Tujuan: Mengaktifkan tombol menu AI agar dapat berinteraksi dengan backend AI Chat dan menyiapkan modul ringkasan/presentasi.

## Konsep Implementasi
1. **Tanya AI (Interactive Chat)**:
    - **Mekanisme**: Membuka input chat dengan prefix khusus (misal: "@AI ") atau langsung mengirim pesan ke bot AI yang ada di grup.
    - **Indikator**: Menangkap event socket `ai.thinking` untuk menampilkan indikator "AI sedang mengetik..." di header atau list chat.
2. **Ringkas (Summarization)**:
    - **Persiapan**: Menyiapkan pemanggilan endpoint `POST /ai/summarize` (placeholder sementara sesuai spek diskusi).
    - **Umpan Balik**: Hasil ringkasan akan muncul sebagai pesan sistem atau pesan dari bot AI.
3. **Buat Slide (Presentation)**:
    - **Persiapan**: Pemanggilan endpoint `POST /ai/generate-presentation`.
    - **Output**: Link download atau pratinjau file presentasi.

## Arsitektur Data
- **Socket Listeners**: Menambahkan listener untuk `ai.thinking` dan `ai.thinking.stop` di `app/chat/[id].tsx`.
- **UI State**: State `isAIThinking` untuk menampilkan animasi loading AI yang premium.
