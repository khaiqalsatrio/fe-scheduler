# Perencana Penyempurnaan Reaksi & Emoji Picker

## Deskripsi
Fitur ini menyempurnakan interaksi reaksi pesan dengan menambahkan kemampuan untuk menghapus reaksi dengan sekali klik (toggle) dan menyediakan pemilih emoji lengkap melalui tombol "+".

## Komponen Utama
1. **Emoji Picker (`components/EmojiPicker.tsx`) [BARU]**:
   - Sebuah modal yang berisi grid emoji yang dapat digulir.
   - Mengelompokkan emoji ke dalam kategori (Wajah, Objek, dsb).
2. **Penyempurnaan `MessageActionMenu`**:
   - Menghubungkan tombol "+" untuk membuka `EmojiPicker`.
3. **Penyempurnaan Logika `handleReact`**:
   - Memastikan sinkronisasi antara klik pada gelembung pesan dan klik pada menu reaksi.

## Langkah-langkah
1. Buat file `components/EmojiPicker.tsx`.
2. Update `components/MessageActionMenu.tsx` untuk mengintegrasikan pemilih emoji.
3. Verifikasi fungsi klik pada chip reaksi di `MessageBubble` agar menghapus reaksi milik kita.

## Referensi UI
- WhatsApp Style: Menekan emoji yang sama = hapus. Menekan "+" = buka lemari emoji.
