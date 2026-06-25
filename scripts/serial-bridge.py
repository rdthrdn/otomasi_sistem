#!/usr/bin/env python3
"""
USB Serial → HTTP Bridge untuk Smart RFID Locker.

Membaca output Serial dari ESP32, mencari baris JSON,
lalu POST ke /api/iot/events website lokal.

Usage:
    python scripts/serial-bridge.py /dev/ttyUSB0        # Linux
    python scripts/serial-bridge.py /dev/cu.SLAB_USBtoUART  # macOS
    python scripts/serial-bridge.py COM3                # Windows
"""

import argparse
import json
import sys
import time

import serial
import requests

API_URL = "http://localhost:3000/api/iot/events"
DEVICE_KEY = "123"  # ganti sesuai .env.local


def parse_args():
    parser = argparse.ArgumentParser(description="Jembatan Serial → HTTP untuk RFID Locker")
    parser.add_argument("port", help="Port serial ESP32 (contoh: /dev/ttyUSB0, COM3)")
    parser.add_argument("--baud", type=int, default=115200, help="Baud rate (default: 115200)")
    parser.add_argument("--api", default=API_URL, help=f"API endpoint (default: {API_URL})")
    parser.add_argument("--key", default=DEVICE_KEY, help="x-device-key header")
    return parser.parse_args()


def main():
    args = parse_args()

    print(f"=== Serial Bridge ===")
    print(f"Port  : {args.port}")
    print(f"Baud  : {args.baud}")
    print(f"API   : {args.api}")
    print(f"Key   : {args.key}")
    print()

    try:
        ser = serial.Serial(args.port, args.baud, timeout=1)
    except serial.SerialException as e:
        print(f"ERROR: Gagal buka {args.port}: {e}")
        sys.exit(1)

    print(f"Terhubung ke {args.port}. Menunggu data...")
    print()

    session = requests.Session()
    session.headers.update({
        "Content-Type": "application/json",
        "x-device-key": args.key,
    })

    line_buffer = ""

    while True:
        try:
            data = ser.read(1)
            if not data:
                continue

            char = data.decode("utf-8", errors="replace")
            line_buffer += char

            if char == "\n":
                line = line_buffer.strip()
                line_buffer = ""

                if not line:
                    continue

                # Cetak semua output Serial
                print(line)

                # Coba parse sebagai JSON
                if line.startswith("{"):
                    try:
                        payload = json.loads(line)
                        event = payload.get("event", "")

                        body = {
                            "uid": payload.get("uid") or payload.get("owner_uid", ""),
                            "current_weight": payload.get("current_weight", 0),
                            "threshold": payload.get("threshold", 1000),
                            "create_log": event == "scan",
                        }
                        send_event(session, args.api, body)

                    except json.JSONDecodeError:
                        pass

        except KeyboardInterrupt:
            print("\nBridge dihentikan.")
            ser.close()
            break

        except serial.SerialException as e:
            print(f"ERROR Serial: {e}")
            time.sleep(2)
            break


def send_event(session: requests.Session, url: str, body: dict):
    """POST event ke API dan tampilkan response."""
    try:
        resp = session.post(url, json=body, timeout=5)
        data = resp.json()
        access = data.get("access", "?")
        wt = data.get("status", {}).get("current_weight", "?")
        occ = data.get("status", {}).get("occupied", "?")
        print(f"  → API: {resp.status_code} | {access} | weight={wt} | occupied={occ}")
    except requests.RequestException as e:
        print(f"  → API ERROR: {e}")


if __name__ == "__main__":
    main()
