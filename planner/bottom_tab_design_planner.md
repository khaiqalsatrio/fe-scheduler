# Perencanaan Desain Sinkronisasi Bottom Tab Menu

Tujuan: Mengimplementasikan navigasi bar bawah (Bottom Tab Bar) yang modern dan bersih sesuai dengan desain gambar yang diberikan.

## Detail Desain (Berdasarkan Gambar)
1. **Jumlah Tab**: 2 Tab utama (**Chat** dan **Itinerary**).
2. **Estetika Aktif**:
   - Tab yang aktif memiliki latar belakang berbentuk kapsul (pill) berwarna hijau muda di belakang ikon.
   - Warna ikon dan teks aktif adalah Hijau WhatsApp/Premium (`#25D366`).
3. **Tab & Konten**:
   - **Chat**: Menggunakan konten dari `app/(tabs)/chats.tsx`.
   - **Itinerary**: Menggunakan konten dari `app/(tabs)/agenda.tsx` (akan dilabeli sebagai Itinerary).
4. **Gaya Tab Bar**: Latar belakang putih bersih, tanpa bayangan yang berlebihan, tinggi yang proporsional untuk layar tinggi.

## Langkah-langkah Implementasi
1. **Modifikasi `app/(tabs)/_layout.tsx`**:
   - Aktifkan kembali komponen `Tabs`.
   - **Logika Login**: Menambahkan `tabBarStyle: { display: 'none' }` pada route `index` agar navigasi tidak muncul di layar onboarding.
   - **Indikator Aktif (Pill)**: Implementasi komponen `TabIcon` kustom dengan background `#D1FAE5`.
2. **Penyesuaian Route & Urutan**:
   - Tab 1 (Kiri): `chats` (Label: "Chat", Icon: `MessageSquare`).
   - Tab 2 (Kanan): `agenda` (Label: "Itinerary", Icon: `Calendar`).
   - Nonaktifkan route lain (`home`, `networking`, dll) dengan `href: null`.

## Status Akhir
- [x] Navigasi berjalan lancar.
- [x] Indikator kapsul muncul pada tab aktif.
- [x] Tab Bar tersembunyi di halaman Login.
- [x] Urutan: Chat (Kiri), Itinerary (Kanan).
