# Product Requirements Document (PRD)

# Smart RFID Locker Monitoring System

Version: 1.0
Status: MVP Development
Date: June 2026

---

# 1. Project Overview

Smart RFID Locker Monitoring System adalah sistem monitoring loker berbasis Internet of Things (IoT) yang memanfaatkan RFID untuk identifikasi pengguna dan Load Cell untuk mendeteksi keberadaan barang di dalam loker.

Sistem ini memungkinkan administrator memantau status penggunaan loker secara real-time melalui dashboard web yang terhubung dengan Supabase sebagai backend.

Tujuan utama proyek adalah menyediakan solusi monitoring loker yang sederhana, murah, dan mudah diimplementasikan untuk kebutuhan laboratorium, kampus, kantor, maupun lingkungan UMKM.

---

# 2. Background

Pada sistem loker konvensional, pengguna maupun administrator harus melakukan pengecekan secara langsung untuk mengetahui apakah loker sedang digunakan atau kosong.

Selain itu, tidak tersedia informasi mengenai:

* Siapa pengguna terakhir loker
* Riwayat akses loker
* Status keberadaan barang di dalam loker

Dengan memanfaatkan ESP32, RFID RC522, Load Cell, dan Supabase, sistem dapat menyediakan monitoring secara real-time melalui dashboard web tanpa memerlukan pengecekan fisik.

---

# 3. Project Objectives

Tujuan proyek ini adalah:

* Mengidentifikasi pengguna loker menggunakan RFID Card atau RFID Keyfob.
* Mendeteksi keberadaan barang di dalam loker menggunakan Load Cell.
* Menyimpan data penggunaan loker pada database cloud.
* Menyediakan dashboard monitoring berbasis web.
* Menampilkan status loker secara real-time.

---

# 4. Project Scope

## In Scope (MVP)

### RFID Authentication

* Membaca UID RFID Card.
* Membaca UID RFID Keyfob.
* Menentukan owner locker pertama.
* Memvalidasi akses berdasarkan owner locker.

### Occupancy Detection

* Menggunakan Load Cell dan HX711.
* Menentukan status:

  * EMPTY
  * OCCUPIED

### Cloud Backend

* Menyimpan status locker.
* Menyimpan owner UID.
* Menyimpan riwayat akses.

### Web Dashboard

* Menampilkan status locker secara real-time.
* Menampilkan owner locker.
* Menampilkan riwayat akses.
* Menampilkan status barang di dalam locker.

---

## Out of Scope (Future Development)

* Servo Lock Automation
* LCD Display
* Mobile Application
* Multi-Locker System
* Push Notification
* Face Recognition
* QR Code Authentication

---

# 5. Hardware Components

| No | Komponen                |
| -- | ----------------------- |
| 1  | ESP32 DevKit V1         |
| 2  | RFID RC522              |
| 3  | RFID Card               |
| 4  | RFID Keyfob             |
| 5  | HX711 Amplifier         |
| 6  | Load Cell 1kg           |
| 7  | Breadboard              |
| 8  | Jumper Wire             |
| 9  | Power Supply (Optional) |

---

# 6. Functional Requirements

## FR-01 RFID Reading

### Description

Sistem harus mampu membaca UID RFID Card maupun RFID Keyfob.

### Input

RFID Card / RFID Keyfob

### Output

UID RFID

### Example

UID:

8921D911

---

## FR-02 Owner Registration

### Description

Jika locker belum memiliki owner, maka UID pertama yang berhasil dipindai akan menjadi owner locker.

### Output

Owner UID tersimpan di database.

---

## FR-03 Access Validation

### Description

Ketika RFID dipindai:

* Jika UID sesuai owner → ACCESS GRANTED
* Jika UID berbeda → ACCESS DENIED

---

## FR-04 Occupancy Detection

### Description

Load Cell digunakan untuk mendeteksi keberadaan barang di dalam locker.

### Logic

```text
diff > threshold
```

Status:

```text
OCCUPIED
```

```text
diff <= threshold
```

Status:

```text
EMPTY
```

---

## FR-05 Activity Logging

### Description

Setiap aktivitas RFID harus disimpan pada database.

### Data Stored

* UID
* Access Result
* Timestamp

---

## FR-06 Real-Time Monitoring

### Description

Dashboard harus menampilkan perubahan status tanpa melakukan refresh halaman.

---

# 7. Non-Functional Requirements

## Performance

Dashboard harus menerima update maksimal dalam waktu:

```text
< 3 detik
```

setelah event terjadi.

---

## Reliability

Sistem harus tetap berjalan selama ESP32 dan Supabase aktif.

---

## Scalability

Struktur database harus mendukung pengembangan ke sistem multi-locker pada versi berikutnya.

---

## Security

Dashboard administrator menggunakan autentikasi Supabase Auth.

---

# 8. System Architecture

```text
+-------------------+
| RFID RC522        |
+---------+---------+
          |
          |
+---------v---------+
| ESP32 DevKit V1   |
+---------+---------+
          |
          |
+---------v---------+
| HX711 + Load Cell |
+---------+---------+
          |
          |
          | WiFi
          |
+---------v---------+
| Supabase Backend  |
+---------+---------+
          |
          |
          | Realtime
          |
+---------v---------+
| Next.js Dashboard |
+-------------------+
```

---

# 9. Database Design

## Table: locker_status

Menyimpan status locker terkini.

| Column         | Type      |
| -------------- | --------- |
| id             | uuid      |
| owner_uid      | text      |
| occupied       | boolean   |
| current_weight | bigint    |
| updated_at     | timestamp |

---

## Table: access_logs

Menyimpan histori akses RFID.

| Column     | Type      |
| ---------- | --------- |
| id         | uuid      |
| uid        | text      |
| result     | text      |
| created_at | timestamp |

---

# 10. Dashboard Requirements

## Dashboard Overview

Menampilkan informasi utama locker.

### Card 1 — Locker Status

Menampilkan:

* EMPTY
* OCCUPIED

---

### Card 2 — Owner UID

Menampilkan UID owner locker saat ini.

Contoh:

```text
8921D911
```

---

### Card 3 — Last RFID Scan

Menampilkan UID terakhir yang dipindai.

---

### Card 4 — Last Update

Menampilkan waktu update terakhir.

---

## Activity Log Table

| Timestamp | UID      | Result         |
| --------- | -------- | -------------- |
| 20:10     | 8921D911 | ACCESS GRANTED |
| 20:12     | 7612F1B8 | ACCESS DENIED  |

---

# 11. Technology Stack

## IoT Device

* ESP32 DevKit V1
* RFID RC522
* HX711
* Load Cell 1kg

---

## Backend

* Supabase Database
* Supabase Realtime
* Supabase Authentication

---

## Frontend

* Next.js 15
* React
* Tailwind CSS
* Shadcn UI

---

# 12. MVP Success Criteria

Proyek dianggap berhasil apabila:

* RFID Card dapat dibaca.
* RFID Keyfob dapat dibaca.
* Owner locker dapat diregistrasikan.
* Load Cell dapat mendeteksi keberadaan barang.
* Data dapat dikirim ke Supabase.
* Dashboard dapat menampilkan status locker secara real-time.
* Riwayat akses dapat tersimpan pada database.

---

# 13. Future Enhancements

## Version 2.0

* Servo Motor Lock Control
* Locker Unlock Automation
* Multi-Locker Management
* Mobile Application
* Push Notification
* Email Notification

## Version 3.0

* Face Recognition
* AI-based Occupancy Prediction
* Multi-Agent Monitoring System
* Predictive Maintenance
* Analytics Dashboard