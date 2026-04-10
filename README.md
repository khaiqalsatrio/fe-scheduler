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

1. Install dependensi:
   ```bash
   npm install
   ```
2. Jalankan Metro Bundler:
   ```bash
   npx expo start
   ```
3. Jalankan di Android:
   ```bash
   npm run android
   ```

---

*Dikembangkan untuk Project Lifecycle Management - ChatAja Mobile*
