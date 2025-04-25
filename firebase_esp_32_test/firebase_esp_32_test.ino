#include <WiFi.h>
#include <SPI.h>
#include <MFRC522.h>
#include <Firebase_ESP_Client.h>
#include <WiFiUdp.h>
#include <NTPClient.h>

#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"

// === WiFi Credentials ===
#define WIFI_SSID "iBall-Baton"
#define WIFI_PASSWORD "yashved1517"

// === Firebase Credentials ===
#define API_KEY "AIzaSyDU0sNr4oEbTxD1R12AcT10IklnoXHcsS4"
#define DATABASE_URL "https://esp32-fb-de877-default-rtdb.firebaseio.com/"

// === RFID Setup ===
#define SS_PIN 21
#define RST_PIN 22
MFRC522 rfid(SS_PIN, RST_PIN);

// === Firebase Objects ===
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

bool signupOK = false;
int scanCount = 0;
const int maxScans = 4;
String lastUID = "";

// === NTP Setup ===
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", 19800, 60000); // UTC +5:30 (India);

String getCurrentTimeString() {
  timeClient.update();
  unsigned long epochTime = timeClient.getEpochTime();
  int year = 1970;

  unsigned long secondsAccountedFor = 0;
  const int SECONDS_PER_DAY = 86400;
  const int SECONDS_PER_HOUR = 3600;
  const int SECONDS_PER_MINUTE = 60;
  int daysInMonth[] = {31,28,31,30,31,30,31,31,30,31,30,31};
  bool leapYear = false;

  while (true) {
    leapYear = (year % 4 == 0 && (year % 100 != 0 || year % 400 == 0));
    unsigned long secondsInYear = leapYear ? 31622400 : 31536000;
    if (secondsAccountedFor + secondsInYear > epochTime) break;
    secondsAccountedFor += secondsInYear;
    year++;
  }

  int month = 0;
  while (month < 12) {
    int daysThisMonth = daysInMonth[month];
    if (month == 1 && leapYear) daysThisMonth = 29;
    if (secondsAccountedFor + daysThisMonth * SECONDS_PER_DAY > epochTime) break;
    secondsAccountedFor += daysThisMonth * SECONDS_PER_DAY;
    month++;
  }

  int day = (epochTime - secondsAccountedFor) / SECONDS_PER_DAY + 1;
  secondsAccountedFor += (day - 1) * SECONDS_PER_DAY;
  int hour = (epochTime - secondsAccountedFor) / SECONDS_PER_HOUR;
  secondsAccountedFor += hour * SECONDS_PER_HOUR;
  int minute = (epochTime - secondsAccountedFor) / SECONDS_PER_MINUTE;
  int second = epochTime - secondsAccountedFor - minute * SECONDS_PER_MINUTE;

  char timeBuffer[20];
  sprintf(timeBuffer, "%04d-%02d-%02d %02d:%02d:%02d", year, month + 1, day, hour, minute, second);
  return String(timeBuffer);
}

void setup() {
  Serial.begin(115200);
  SPI.begin();
  rfid.PCD_Init();

  // Wi-Fi Connect
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }
  Serial.println("\nWiFi connected");

  // Start NTP client
  timeClient.begin();
  while (!timeClient.update()) {
    timeClient.forceUpdate();
  }

  // Firebase Config
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

  // Anonymous sign-up
  if (Firebase.signUp(&config, &auth, "", "")) {
    Serial.println("Firebase sign-up successful");
    signupOK = true;
  } else {
    Serial.printf("Firebase sign-up failed: %s\n", config.signer.signupError.message.c_str());
  }

  config.token_status_callback = tokenStatusCallback;
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
}

void loop() {
  if (!Firebase.ready() || !signupOK) return;

  if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) return;

  // Read UID
  String uid = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    if (rfid.uid.uidByte[i] < 0x10) uid += "0";
    uid += String(rfid.uid.uidByte[i], HEX);
  }
  uid.toUpperCase();

  // Handle new UID
  if (uid != lastUID) {
    lastUID = uid;
    scanCount = 0;
    Serial.println("New card detected, scan count reset");
  }

  if (scanCount < maxScans) {
    scanCount++;

    Serial.printf("Scan #%d for UID: %s\n", scanCount, uid);

    // Create JSON object
    FirebaseJson json;
    json.set("Location", scanCount);
    json.set("timestamp", getCurrentTimeString());

    String path = "/rfid/logs/" + uid;

    if (Firebase.RTDB.pushJSON(&fbdo, path, &json)) {
      Serial.println("Data pushed to Firebase:");
      Serial.println("Path: " + fbdo.dataPath());
    } else {
      Serial.println("Failed to push JSON to Firebase:");
      Serial.println("Error: " + fbdo.errorReason());
    }
  } else {
    Serial.println("Max 4 scans reached for UID: " + uid);
  }

  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
  delay(2000);
}
