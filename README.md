# Smart RFID Locker Monitoring System

Dashboard monitoring loker RFID + load cell berbasis Next.js 15 dan Supabase.

## Fitur MVP

- Login admin menggunakan Supabase Auth.
- Dashboard realtime untuk status loker: `EMPTY` / `OCCUPIED`.
- Menampilkan owner UID, scan RFID terakhir, berat load cell, dan waktu update.
- Tabel riwayat akses RFID dengan hasil `ACCESS GRANTED` / `ACCESS DENIED`.
- API server-side untuk ESP32 agar update database tidak memakai key tulis di perangkat.
- Schema Supabase dengan RLS, index, dan Realtime publication.

## Stack

- Next.js 15 App Router
- React 19
- Tailwind CSS v4
- Supabase Auth, Postgres, Realtime

## Setup lokal

1. Install dependency:

   ```bash
   npm install
   ```

2. Copy environment file:

   ```bash
   cp .env.example .env.local
   ```

3. Isi variabel berikut:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-or-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   IOT_DEVICE_KEY=replace-with-a-long-random-device-secret
   ```

4. Jalankan migrasi SQL di `supabase/migrations/202606240001_init_locker_monitoring.sql` ke project Supabase.

5. Buat user admin di Supabase Dashboard → Authentication → Users.

6. Jalankan app:

   ```bash
   npm run dev
   ```

7. Buka `http://localhost:3000`.

## Tes USB Serial (tanpa WiFi)

Gunakan bridge Python untuk menghubungkan ESP32 ke website via kabel USB.

### 1. Upload firmware

Buka `public/iot.ino` di Arduino IDE, upload ke ESP32.

### 2. Install bridge

```bash
pip install pyserial requests
```

### 3. Jalankan bridge

Cari port ESP32 kamu:

- **macOS**: `ls /dev/cu.*`
- **Linux**: `ls /dev/ttyUSB*` atau `ls /dev/ttyACM*`
- **Windows**: lihat di Device Manager → Ports (COM & LPT)

```bash
# Ganti /dev/ttyUSB0 sesuai port kamu
python scripts/serial-bridge.py /dev/ttyUSB0
```

Bridge akan menampilkan semua output Serial ESP32.
Setiap kali scan RFID, bridge mengirim data ke API dan dashboard akan update realtime.

**Catatan:** Atur `IOT_DEVICE_KEY` di `.env.local` dan di baris `DEVICE_KEY` di `serial-bridge.py` harus sama.

### 4. Test

1. Buka `http://localhost:3000/dashboard`
2. Tap RFID card ke RC522
3. Lihat Serial Monitor bridge → `API: 200 | ACCESS GRANTED`
4. Dashboard berubah dalam <3 detik

---

## Endpoint ESP32 (via WiFi)

Jika sudah pakai WiFi, ESP32 bisa langsung POST ke:

```http
POST /api/iot/events
x-device-key: <IOT_DEVICE_KEY>
content-type: application/json
```

Payload:

```json
{
  "uid": "8921D911",
  "current_weight": 128,
  "threshold": 50
}
```

Response contoh:

```json
{
  "status": {
    "id": "...",
    "owner_uid": "8921D911",
    "occupied": true,
    "current_weight": 128,
    "updated_at": "2026-06-24T...Z"
  },
  "access": "ACCESS GRANTED",
  "threshold": 50
}
```

Rules MVP:

- Jika belum ada `owner_uid`, UID pertama otomatis menjadi owner.
- Jika UID sama dengan owner → `ACCESS GRANTED`.
- Jika UID berbeda → `ACCESS DENIED`.
- Jika `current_weight > threshold` → `OCCUPIED`; selain itu `EMPTY`.

## Database

### `locker_status`

Menyimpan status terkini loker.

- `id uuid`
- `owner_uid text`
- `occupied boolean`
- `current_weight bigint`
- `updated_at timestamptz`
- `created_at timestamptz`

### `access_logs`

Menyimpan histori scan RFID.

- `id uuid`
- `locker_id uuid`
- `uid text`
- `result text`
- `created_at timestamptz`

## Validasi

```bash
npm run typecheck
npm run build
```
