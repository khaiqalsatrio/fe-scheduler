# Planner: Implementasi Fitur AI (ChatAja Premium AI)

Berdasarkan `CHAT_APIDOC.md` dan `WEBSOCKET.md`, kita akan mengaktifkan fungsionalitas tombol AI pada layar chat.

## 1. Konsep Fungsional
Aplikasi akan berkomunikasi dengan bot AI bawaan grup (ID: `00000...000`) melalui pemicu pesan dan menangani sinyal real-time.

### A. Tanya AI
- **Pemicu**: Saat tombol "Tanya AI" diklik, aplikasi akan otomatis mengisi input chat atau membuka konteks tanya jawab.
- **Logika**: Mengirim pesan biasa ke grup di mana AI bot telah menjadi member otomatis.

### B. Ringkas (Summarize) & Buat Slide
- **Pemicu**: Mengirim pesan perintah khusus (pancingan) ke AI, misalnya: `/summarize` atau `/presentation`.
- **Eksperimen**: Mengamati respon AI terhadap perintah tersebut untuk validasi fungsionalitas backend yang belum terekspos.

## 2. Peningkatan User Experience (Premium)
Menggunakan event WebSocket `ai.thinking` untuk menampilkan indikator visual saat AI sedang memproses data.
- **UI State**: "AI sedang menyiapkan balasan..." muncul di bawah chat bubble terakhir saat event diterima.
- **UI State Stop**: Menghilangkan indikator saat `ai.thinking.stop` diterima.

## 3. Alur Teknis
1.  **Socket Listener**: Menambahkan handler untuk `ai.thinking` dan `ai.thinking.stop` di `app/chat/[id].tsx`.
2.  **Action Switch**: Menghubungkan fungsi di `ChatDetailScreen` ke pilihan menu di `aiMenuContainer`.
3.  **Prompt Engineering**: Menyiapkan template prompt untuk fitur Ringkas dan Slide.

## 4. Temuan Riil & Status Terkini
- **Status Integrasi**: Frontend sudah 100% terintegrasi dengan `dev-ows-api`.
- **Kendala Backend**: Endpoint `/ai-insight/document/{id}` memberikan respon `Document not found` jika dikirimkan ID Percakapan. Ini menegaskan bahwa API tersebut spesifik untuk analisis File.
- **Strategi Selanjutnya**: Berkoordinasi dengan mentor untuk penyediaan endpoint khusus `conversation_summary` atau aktivasi Bot di room chat.

