#include <SPI.h>
#include <MFRC522.h>
#include "HX711.h"

// =====================
// RC522
// =====================

#define SS_PIN 5
#define RST_PIN 22

MFRC522 rfid(SS_PIN, RST_PIN);

// =====================
// HX711
// =====================

#define DOUT_PIN 32
#define HX711_SCK_PIN 33

HX711 scale;

// =====================
// SYSTEM
// =====================

long baseline = 0;
const long THRESHOLD = 1000;

bool occupied = false;
bool ownerAssigned = false;

String ownerUID = "";

unsigned long lastStatusPrint = 0;

// =====================
// SETUP
// =====================

void setup()
{
  Serial.begin(115200);

  Serial.println();
  Serial.println("SMART LOCKER STARTING...");
  Serial.println();

  // =====================
  // RFID
  // =====================

  SPI.begin(18, 19, 23, 5);

  rfid.PCD_Init();

  delay(500);

  Serial.println("=== RC522 CHECK ===");

  byte version = rfid.PCD_ReadRegister(MFRC522::VersionReg);

  Serial.print("Version: 0x");
  Serial.println(version, HEX);

  if (version == 0x00 || version == 0xFF)
  {
    Serial.println("RC522 NOT DETECTED");
  }
  else
  {
    Serial.println("RC522 DETECTED");
  }

  Serial.println();

  // =====================
  // HX711
  // =====================

  scale.begin(DOUT_PIN, HX711_SCK_PIN);

  Serial.println("Waiting HX711...");

  unsigned long startTime = millis();

  while (!scale.is_ready())
  {
    Serial.print(".");

    delay(500);

    if (millis() - startTime > 10000)
    {
      Serial.println();
      Serial.println("HX711 TIMEOUT!");
      break;
    }
  }

  Serial.println();
  Serial.println("HX711 READY");

  delay(1000);

  // Ambil baseline awal

  if (scale.is_ready())
  {
    baseline = scale.read_average(20);
  }

  Serial.print("Baseline = ");
  Serial.println(baseline);

  Serial.println();
  Serial.println("READY");
  Serial.println();
}

// =====================
// LOOP
// =====================

void loop()
{
  long current = 0;
  long diff = 0;

  // =====================
  // LOAD CELL
  // =====================

  if (scale.is_ready())
  {
    current = scale.read_average(5);

    diff = abs(current - baseline);

    occupied = diff > THRESHOLD;
  }

  // =====================
  // RFID
  // =====================

  if (rfid.PICC_IsNewCardPresent() &&
      rfid.PICC_ReadCardSerial())
  {
    String uid = "";

    for (byte i = 0; i < rfid.uid.size; i++)
    {
      if (rfid.uid.uidByte[i] < 0x10)
      {
        uid += "0";
      }

      uid += String(rfid.uid.uidByte[i], HEX);
    }

    uid.toUpperCase();

    Serial.println();
    Serial.println("====================");
    Serial.print("CARD UID: ");
    Serial.println(uid);

    // Register owner pertama

    if (!ownerAssigned)
    {
      ownerUID = uid;
      ownerAssigned = true;

      Serial.println("OWNER REGISTERED");
    }
    else
    {
      if (uid == ownerUID)
      {
        Serial.println("ACCESS GRANTED");
      }
      else
      {
        Serial.println("ACCESS DENIED");
      }
    }

    Serial.println("====================");
    Serial.println();

    // JSON untuk serial bridge
    Serial.print("{\"event\":\"scan\",\"uid\":\"");
    Serial.print(uid);
    Serial.print("\",\"current_weight\":");
    Serial.print(current);
    Serial.print(",\"threshold\":");
    Serial.print(THRESHOLD);
    Serial.println("}");

    rfid.PICC_HaltA();
    rfid.PCD_StopCrypto1();
  }

  // =====================
  // STATUS
  // =====================

  if (millis() - lastStatusPrint > 2000)
  {
    lastStatusPrint = millis();

    Serial.println("-------- LOCKER STATUS --------");

    Serial.print("Owner UID : ");

    if (ownerAssigned)
    {
      Serial.println(ownerUID);
    }
    else
    {
      Serial.println("NONE");
    }

    Serial.print("Baseline  : ");
    Serial.println(baseline);

    Serial.print("Current   : ");
    Serial.println(current);

    Serial.print("Diff      : ");
    Serial.println(diff);

    Serial.print("Status    : ");

    if (occupied)
    {
      Serial.println("OCCUPIED");
    }
    else
    {
      Serial.println("EMPTY");
    }

    Serial.println("--------------------------------");
    Serial.println();

    // JSON untuk serial bridge
    Serial.print("{\"event\":\"status\",\"occupied\":");
    Serial.print(occupied ? "true" : "false");
    Serial.print(",\"current_weight\":");
    Serial.print(current);
    Serial.print(",\"owner_uid\":\"");
    if (ownerAssigned) { Serial.print(ownerUID); }
    Serial.println("\"}");
  }
}