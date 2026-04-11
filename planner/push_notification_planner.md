# Perencana Push Notification

## Ringkasan
Integrasi push notification ke dalam ChatAja Mobile menggunakan Expo Notification Service. Implementasi ini akan memungkinkan aplikasi untuk menerima pesan meskipun dalam kondisi di latar belakang (background) atau tertutup.

## Arsitektur & Lingkungan
- **Perangkat Fisik**: Didukung penuh (Android & iOS).
- **Emulator Android**: Didukung jika memiliki Google Play Services.
- **iOS Simulator**: Tidak didukung (batasan sistem Apple).

### 1. Manajemen Token
- **Meminta Izin**: Menggunakan `expo-notifications` untuk meminta izin dari pengguna.
- **Mendapatkan Expo Push Token**: Mengambil token unik untuk perangkat menggunakan `Notifications.getExpoPushTokenAsync`.
- **Sinkronisasi Backend**: Mengirim token ke Backend (BE) untuk disimpan dan dikaitkan dengan akun pengguna.

### 2. Penanganan Notifikasi
- **Foreground (Aplikasi Terbuka)**: Menangani notifikasi yang datang saat aplikasi sedang dibuka menggunakan `setNotificationHandler`.
- **Background/Killed (Latar Belakang/Tertutup)**: Notifikasi akan ditangani oleh sistem operasi dan ditampilkan di tray notifikasi sistem.
- **Interaksi**: Mendefinisikan listener untuk menangani kasus di mana pengguna mengetuk notifikasi untuk membuka aplikasi atau chat tertentu.

## Stack Teknis
- `expo-notifications`: Library utama untuk menangani notifikasi.
- `expo-device`: Untuk mendeteksi tipe perangkat (mendukung perangkat fisik dan emulator Android dengan Play Services).
- `expo-constants`: Untuk mengakses konfigurasi proyek.

## Integrasi Backend
- **Endpoint**: TBD (Placeholder: `POST /notifications/token`)
- **Payload**:
  ```json
  {
    "token": "ExponentPushToken[xxxxxxxxxxxx]",
    "platform": "ios" | "android",
    "deviceId": "uuid"
  }
  ```

## Pertimbangan UI/UX
- Meminta izin secara kontekstual (misalnya: setelah login atau saat pertama kali membuka daftar chat).
- Memberikan masukan yang jelas jika notifikasi dinonaktifkan di pengaturan sistem.
