# Perencana Fitur Voice Note (VN) - Final

## Deskripsi
Fitur ini memungkinkan pengguna merekam pesan suara secara langsung dari aplikasi, mengirimkannya ke server dengan format MP3, dan memutarnya kembali dengan antarmuka premium layaknya WhatsApp.

## Komponen Utama (Terimplementasi)
1. **Perekaman (Recording)**:
   - **Engine**: Menggunakan `expo-av`.
   - **Format**: MP3 (`.mp3`) dengan MIME `audio/mpeg`.
   - **UI**: Overlay rekaman dengan timer yang sinkron (menggunakan `setOnRecordingStatusUpdate`) dan indikator dot merah berkedip.
   - **Kontrol**: Tombol Batal (Cancel) dan Kirim (Stop).

2. **Backend & Persistence**:
   - **Upload**: Menggunakan `multipart/form-data` dengan tipe `voice`.
   - **Mapping**: Perbaikan pada `app/chat/[id].tsx` untuk memastikan pesan tipe `voice` tetap dikenali sebagai audio player saat memuat riwayat pesan (history).

3. **Pemutaran (Playback)**:
   - **Engine**: Menggunakan `expo-av` dengan `soundRef` untuk stabilitas.
   - **UI**: Konsep WhatsApp Premium dengan tombol Play/Pause berwarna, bilah progres, dan indikator mikrofon biru (saat diputar).
   - **Logika**: Audio berhenti total setelah diputar satu kali dan dapat diputar ulang secara manual dari awal.

## Alur Data
- User merekam -> Output MP3 -> Upload ke /v1/messages (type: voice) -> Emit via Socket -> Receiver memetakan metadata meta.file -> UI MessageBubble merender Player Audio.
