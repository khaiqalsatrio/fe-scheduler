# Perencana Fitur Voice Note (VN)

## Deskripsi
Fitur ini memungkinkan pengguna untuk mengirim pesan suara. Prosesnya melibatkan perekaman audio lokal, pengunggahan file ke server, dan pemutaran audio di sisi penerima.

## Komponen Utama
1. **Perekaman (Recording)**:
   - Menggunakan `expo-av` (Audio.Recording).
   - Menangani izin mikrofon.
   - UI: Tombol Mic yang berubah fungsi saat ditekan (Hold to record / Click to record).

2. **Pengunggahan (Uploading)**:
   - Mengambil URI rekaman.
   - Mengirim sebagai `multipart/form-data` ke `/v1/messages`.
   - Tipe pesan: `voice`.

3. **Pemutaran (Playback)**:
   - Menggunakan `expo-av` (Audio.Sound).
   - UI: Bubble khusus dengan tombol play/pause dan seek bar.

## Alur Data
- User merekam -> File disimpan di cache -> Upload ke BE -> BE simpan dan broadcast via Socket -> Receiver terima & download/stream URL.
