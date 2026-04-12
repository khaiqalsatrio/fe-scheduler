# Perencanaan Desain Halaman Teruskan Pesan

Tujuan: Memperbaiki UI pada halaman `forward-select.tsx` agar tidak bertabrakan dengan notch/status bar dan memiliki gaya yang konsisten dengan halaman Chat yang baru dioptimalkan.

## Masalah Utama
1. **Colliding Header**: Header "Teruskan ke..." terlalu mepet ke atas (bertabrakan dengan notch).
2. **Inkonsistensi**: Gaya header masih menggunakan gaya lama (tinggi 65, padding minim).

## Perbaikan yang Direncanakan
1. **Peningkatan Safe Area**: Menambahkan penanganan `StatusBar.currentHeight` untuk Android di `SafeAreaView`.
2. **Modernisasi Header**:
   - Menyesuaikan tinggi header menjadi **72**.
   - Menyesuaikan ukuran font judul dan subjudul.
   - Menggunakan padding yang konsisten (**12** atau **15**).
3. **Penyelarasan List Item**: Menyelaraskan ukuran avatar dan spasi list agar seragam dengan navigasi utama.

## Alur Kerja
1. Modifikasi `app/forward-select.tsx`:
   - Tambahkan import `Platform` dan `StatusBar` dari `react-native`.
   - Update `styles.safeArea` untuk menangani padding atas pada Android.
   - Update `styles.header` untuk tinggi dan padding baru.
   - Update gaya teks judul dan tombol.
2. Verifikasi tampilan pada resolusi 1080x2424.
