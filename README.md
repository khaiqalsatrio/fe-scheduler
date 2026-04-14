# 🚀 Project Tera - AI Chat Scheduler

**Tera** adalah asisten AI partner yang dirancang untuk membantu produktivitas di ITD Summit. Aplikasi ini memungkinkan pengguna untuk berdiskusi, merangkum sesi, dan membangun koneksi secara real-time.

---

## ✨ Fitur Utama

- **Real-time Chatting**: Didukung oleh **Socket.IO** untuk pengiriman pesan instan dan indikator mengetik.
- **Smart Connection**: Cari dan bangun koneksi baru dengan kontributor, designer, dan engineer lainnya.
- **AI-Powered Insight**: Integrasi AI untuk merangkum diskusi dan membuat action items secara otomatis.
- **Google Authentication**: Login cepat dan aman menggunakan Google Sign-In.
- **Profile Management**: Kelola data personal dan pantau status akun kamu.

---

## 🛠️ Konfigurasi Penting

### 1. Google Sign-In
Agar fitur login Google berfungsi, kamu wajib mengganti `webClientId` di `app/index.tsx` baris 69:
```typescript
GoogleSignin.configure({
  webClientId: 'YOUR_REAL_WEB_CLIENT_ID.apps.googleusercontent.com',
  // ...
});
```

### 2. API Endpoint
Aplikasi ini terhubung ke backend **BTA Chat API**:
- **Base URL**: `https://dev-ows-api.telkom-digital.id/v1`
- **WebSocket**: `https://dev-ows-api.telkom-digital.id`

---

## 📂 Struktur Proyek

- `/app`: Halaman navigasi utama (Expo Router).
- `/components`: Komponen UI modular (ChatInput, MessageBubble, dll).
- `/assets`: Aset gambar dan logo.
- `WEBSOCKET.md`: Panduan integrasi layer real-time.
- `CHAT_APIDOC.md`: Dokumentasi endpoint RESTful.

---

## ⚠️ Troubleshooting & Catatan Pengembang

### Izin Akses (Insufficient Role Permissions)
Saat ini fitur pencarian koneksi (`/v1/users`) membutuhkan role **Admin**. Jika akun kamu mendapatkan error "Insufficient role permissions", berarti akun Google kamu dikenali sebagai user standard. Hubungi tim Backend untuk penyesuaian role.

### Perbaikan RedBox (InternalBytecode.js)
Aplikasi telah menggunakan library `buffer` untuk menangani dekode JWT token alih-alih `atob()` bawaan yang tidak didukung penuh di React Native Hermes. Hal ini mencegah error "InternalBytecode.js" saat aplikasi sedang memproses token login.

---

## 🚀 Cara Menjalankan

### 1. Persiapan Awal
Pastikan Anda sudah menginstal dependensi:
```bash
npm install
```

### 2. Menjalankan di Development (Metro Bundler)
```bash
npx expo start
```

### 3. Menjalankan di iOS (Emulator/Device)
Pastikan Anda menggunakan Mac dan sudah menginstal CocoaPods:
```bash
# Menjalankan langsung
npm run ios

# Jika ingin melakukan clean install pods terlebih dahulu
cd ios && pod install && cd ..
npm run ios
```

### 4. Menjalankan di Android (Emulator/Device)
Pastikan Android Studio dan SDK sudah terkonfigurasi:
```bash
npm run android
```

---

## 🏗️ Cara Build (Production)

### Build Android (APK/AAB)

#### Opsi A: Local Build (Membutuhkan Android Studio/SDK)
Untuk menghasilkan APK Debug/Release di lokal:
```bash
# Untuk Debug APK
npx expo run:android --variant debug

# Untuk Release APK
npx expo run:android --variant release
```
Hasil build akan berada di `android/app/build/outputs/apk/`.

#### Opsi B: EAS Build (Cloud Build - Direkomendasikan)
Jika Anda menggunakan Expo Application Services:
```bash
# Login ke akun Expo
npx eas-cli login

# Build APK (konfigurasi di eas.json)
eas build --platform android --profile preview
```

#### Opsi C: Native Gradle Build (Manual)
Jika folder `android` sudah digenerate (via `prebuild`), Anda bisa build langsung menggunakan Gradle:
```bash
cd android

# Membersihkan build sebelumnya
./gradlew clean

# Build APK Release
./gradlew assembleRelease

# Build AAB (untuk Play Store)
./gradlew bundleRelease
```
Hasil `.apk` akan berada di `android/app/build/outputs/apk/release/`.

---

*Dikembangkan untuk Project Lifecycle Management - ChatAja Mobile*


