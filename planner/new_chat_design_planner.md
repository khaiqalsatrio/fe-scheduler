# Planner: Redesain Layar Cari Koneksi (V3 - Multi-Select & Dynamic CTA)

Tujuan: Mengimplementasikan sistem seleksi ganda yang memungkinkan user memulai chat DM atau membuat grup diskusi secara langsung dari satu layar.

## Konsep Desain V3 (Final)
1. **Typography & Header**:
    - Title: "Cari Koneksi".
    - **Separator**: Divider garis abu-abu tipis (tebal 1.5) yang membatasi area Search Bar dengan presisi tinggi.
2. **Multi-Selection Architecture (New)**:
    - **Toggle Logic**: Array-based selection (`selectedUserIds`).
    - **Visual List**: Checkmark hijau pada avatar untuk seluruh user yang terpilih.
    - **Top Bar Selection**: Chip bar horizontal yang menampilkan nama-nama user terpilih yang bisa dihapus satu per satu.
3. **Dynamic Call-to-Action (CTA)**:
    - **Mode 1 (1 User)**: Tombol bertuliskan "Mulai Chat" -> Navigasi ke DM.
    - **Mode 2 (>1 Users)**: Tombol bertuliskan "Buat Grup Diskusi" -> Navigasi ke Create Group screen.
4. **Dynamic Data Integration**:
    - Chip kategori dihasilkan secara otomatis dari data `position` API.

## Arsitektur Data
- **State Selection**: Berubah dari `string | null` ke `string[]`.
- **Navigation Branching**: Logika di dalam `handleStartChat` menentukan apakah akan memanggil API pembuatan DM atau mengarahkan ke formulir grup berdasarkan jumlah ID terpilih.
