# Refactoring Plan - Clean Architecture Phase 1

Tujuan: Membangun fondasi infrastruktur kode agar terpisah dari layer UI.

## 1. Constants & Config
- Memusatkan URL API ke `constants/Config.ts`.
- Menghilangkan hardcoded strings di seluruh aplikasi.

## 2. Centralized Types
- Memindahkan semua Interface (`Message`, `Conversation`, `User`, dll) ke folder `types/`.
- Menghilangkan redundansi pendefinisian tipe data di tiap file `.tsx`.

## 3. API Client Service
- Membuat `services/apiClient.ts` untuk standarisasi request HTTP.
- Otomatisasi handling Bearer Token dari SecureStore.

## 4. Business Logic Service
- Ekstraksi logika API dari `chats.tsx` ke `services/chatService.ts`.
- Ekstraksi logika API dan Socket dari `[id].tsx` ke `services/messageService.ts`.

---
*Status: Ready to Execute*
