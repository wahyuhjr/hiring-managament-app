### Rakamin Job Portal – Runbook & Login Guide

Aplikasi portal lowongan kerja berbasis Next.js + Supabase.

### Live URL

- Production: `https://hiring-m363tz7p1-wahyuhjrs-projects.vercel.app`

### Akun Uji

- Admin: `admin@rakamin.com` | password: `admin123`
- User: `user@rakamin.com` | password: `user123`

Setelah login sebagai Admin, buka halaman `Admin → Jobs` untuk membuat atau mengelola lowongan. User dapat melamar melalui halaman `Portal` dan detail job.

## Cara Menjalankan Secara Lokal

1) Clone & install dependencies

```bash
git clone <repo-url>
cd rakamin
npm install
```

2) Siapkan environment Supabase

- Salin `supabase_env_template.txt` menjadi `.env.local`, lalu isi nilai yang diminta.
- Jika belum punya project/database, ikuti `SUPABASE_SETUP.md`.

3) Setup database (opsional jika memakai DB lokal)

```bash
npm run db:push      # atau npm run db:migrate
npm run db:seed      # isi data awal
```

4) Jalankan aplikasi

```bash
npm run dev
# buka http://localhost:3000
```

## Build & Production

```bash
npm run build
npm start
```

## Deploy ke Vercel

Proyek sudah terhubung ke Vercel dan terdeploy ke URL di atas. Untuk redeploy manual:

```bash
vercel --prod
```

Jika pertama kali link, ikuti prompt untuk membuat/menautkan project. Build command default: `next build`.

## Catatan Fitur Form Lamaran

- Field dapat diatur `Mandatory`, `Optional`, atau `Off` dari `Admin → Jobs`.
- Validasi front-end dan back-end sudah sinkron mengikuti konfigurasi tersebut.
- `Photo Profile` default-nya optional; akan dikirim hanya jika diisi.

## Struktur Penting

- API route job & pelamar: `src/app/api/jobs/*`
- Halaman apply: `src/app/portal/[id]/apply/page.jsx`
- Komponen Admin: `src/components/jobs/*`

---

Jika ada kendala setup atau deploy, sertakan log error dari terminal atau halaman build Vercel saat melaporkan masalah.
