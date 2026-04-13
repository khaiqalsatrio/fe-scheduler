# Planner: Implementasi Fitur Mute/Unmute Chat

Fitur ini memungkinkan pengguna untuk membisukan (mute) atau mengaktifkan kembali (unmute) notifikasi untuk percakapan tertentu.

## Rencana Implementasi

### 1. Service Layer (`services/chatService.ts`)
- Menambahkan fungsi `muteConversation(id: string, isMuted: boolean)` yang memanggil `PUT /v1/conversations/{id}/mute`.

### 2. State & Hooks Layer (`hooks/useChatMessages.ts`)
- Menambahkan state `isMuted` ke dalam hook.
- Mengambil nilai awal `is_muted` dari info percakapan saat fetch history.
- Menambahkan listener WebSocket `conversation.muted` untuk sinkronisasi real-time.
- Mengekspos fungsi `handleMute` ke UI.

### 3. UI Layer (Daftar Chat - `app/(tabs)/chats.tsx`)
- Menambahkan ikon dinamis di header mode seleksi (Long Press):
    - **BellOff**: Muncul jika ada chat terpilih yang belum di-mute (membuka Dialog Durasi).
    - **Bell**: Muncul jika semua chat terpilih sudah di-mute (langsung mengaktifkan suara).
- Implementasi **MuteDurationModal**:
    - Pilihan durasi: 8 Jam, 1 Minggu, Selalu.
    - Animasi spring/bounce untuk estetika premium.

### 4. UI Layer (Komponen - `components/ChatItem.tsx`)
- Menampilkan ikon volume-off (mute) abu-abu di area footer item chat jika percakapan dibisukan, agar selaras dengan desain WhatsApp.

### 5. UI Layer (Detail Chat - `app/chat/[id].tsx`)
- Integrasi status mute di dalam percakapan (sinkronisasi via hook).

## Referensi API
- `PUT /v1/conversations/{id}/mute`
- Body: `{"isMuted": boolean}`
- WebSocket: `conversation.mute` (emit) & `conversation.muted` (on).
