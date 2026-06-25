# ESP32 Request Example

Gunakan endpoint Next.js `/api/iot/events` agar ESP32 tidak perlu menyimpan Supabase service-role key.

## cURL test

```bash
curl -X POST http://localhost:3000/api/iot/events \
  -H 'content-type: application/json' \
  -H 'x-device-key: replace-with-your-IOT_DEVICE_KEY' \
  -d '{"uid":"8921D911","current_weight":128,"threshold":50}'
```

## Arduino-style request body

```json
{
  "uid": "8921D911",
  "current_weight": 128,
  "threshold": 50
}
```

`threshold` opsional. Jika tidak dikirim, server memakai default `50` gram.

## Catatan firmware

- Normalisasi UID dilakukan di server: uppercase dan hanya karakter hex.
- Kirim `current_weight` sebagai angka gram dari hasil kalibrasi load cell.
- Simpan `IOT_DEVICE_KEY` sebagai secret di firmware; ganti jika bocor.
