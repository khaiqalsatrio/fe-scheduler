# Planner: Detail Grup & Manajemen Anggota

Fitur ini menyediakan halaman profil grup di mana pengguna dapat melihat informasi grup, daftar anggota, serta melakukan perubahan jika memiliki wewenang (admin).

## Rencana Implementasi

### 1. Service Layer (`services/chatService.ts`)
- Menambahkan fungsi `getGroupMembers(id: string)`: `GET /conversations/:id/members`.
- Menambahkan fungsi `updateGroupInfo(id: string, data: { title?: string, avatar?: any })`: `PATCH /conversations/:id`.
- Menambahkan fungsi `addMember(id: string, userId: string)`: `POST /conversations/:id/members`.
- Menambahkan fungsi `removeMember(id: string, userId: string)`: `DELETE /conversations/:id/members/:userId`.

### 2. Antarmuka Pengguna (UI) - Halaman Detail (`app/group-detail/[id].tsx`)
- **Header Profil**: Menampilkan foto grup besar secara sirkular.
- **Informasi Grup**: Nama grup dengan ikon pensil untuk mengedit (khusus admin).
- **Sub-info**: Menampilkan tipe (Grup) dan jumlah anggota.
- **Daftar Anggota**: Menampilkan daftar user yang tergabung dalam grup dengan peran mereka (Admin/Member).
- **Aksi Grup**: Tombol "Tambah Anggota" dan "Keluar Grup".

### 3. Integrasi Navigasi (`app/chat/[id].tsx`)
- Memperbarui header ruang chat agar dapat diklik jika bertipe grup.
- Menambahkan navigasi ke `/group-detail/[id]` saat header diklik.

## Referensi API
- `GET /conversations/:id/members`
- `PATCH /conversations/:id`
- `POST /conversations/:id/members`
- `DELETE /conversations/:id/members/:userId`
