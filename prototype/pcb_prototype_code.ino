#include <Arduino.h>
#include <WiFi.h>
#include <PMS5003.h>
#include <LiquidCrystal.h>
#include <SMTP.h>

#define PMS_RX_PIN 12
#define PMS_TX_PIN 13

#define MQ_2_PIN A0   

#define LCD_RS 5
#define LCD_EN 4
#define LCD_D4 3
#define LCD_D5 2
#define LCD_D6 A2
#define LCD_D7 A1

#define BUZZER_PIN 6
#define LED_green 1
#define LED_red 1

// Define WiFi 
const char* ssid = "THE_WIFI_SSID";
const char* password = "THE_WIFI_PASSWORD";

// Define server address
const char* serverAddress = "LOCAL HOST";
const int serverPort = 80;

const char* email = "sender@example.com";
const char* name = "Name";

const char* recipient_email = "recipient@example.com";//the custemer mail

String subject = "Email from LOCAL HOST";
String body = "This is an email sent from LOCAL HOST the level of pollution is Toxic for human body";

// Define PM in normal condition (µg/m³)
const float PM1_0_normal = 150.0;
const float PM2_5_normal = 35.0;
const float PM10_normal = 150.0;
// Define gas concentration in normal condition
const int GAS_CONCENTRATION_normal = 500;

// Instantiate PMS5003 sensor object
PMS5003 sensor(PMS_RX_PIN, PMS_TX_PIN);

// Instantiate LCD object (LiquidCrystal library)
LiquidCrystal lcd(LCD_RS, LCD_EN, LCD_D4, LCD_D5, LCD_D6, LCD_D7);


void setup() {
  // sets the serial port to 9600
  Serial.begin(9600);

  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_green, OUTPUT);
  pinMode(LED_red, OUTPUT);
  lcd.begin(16, 2);

  // Connect to WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.println("Connecting to WiFi..");
  }
  Serial.println("Connected to the WiFi network");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
}

void loop() {

  // Read PMS data
  sensor.readData();

  // Get PM1.0, PM2.5, and PM10 values
  float pm1_0 = sensor.getPM1_0Concentration();
  float pm2_5 = sensor.getPM2_5Concentration();
  float pm10 = sensor.getPM10Concentration();

  // Read MQ-2 gas sensor
  int gasConcentration = analogRead(MQ_2_PIN);

  bool PmToxic = pm1_0 > PM1_0_normal || pm2_5 > PM2_5_normal || pm10 > PM10_normal;
  bool GasToxic = gasConcentration > GAS_CONCENTRATION_normal;

  
  // Trigger buzzer if any normal is exceeded
  if (PmToxic || GasToxic) 
  {
    digitalWrite(BUZZER_PIN, HIGH);
    digitalWrite(LED_red, HIGH);
    lcd.clear();
    lcd.print("Toxic levels detected!");
      // Send email
  SMTP smtp;
  if (!smtp.begin(serverAddress, serverPort, email, name)) {
    Serial.println("Failed to connect to SMTP server");
    return;
  }
  if (!smtp.sendMail(recipient_email, subject, body)) {
    Serial.println("Failed to send email");
    return;
  }
  Serial.println("Email sent successfully");
  } 
  else {
    digitalWrite(LED_green, HIGH);
    digitalWrite(BUZZER_PIN, LOW);
  }
  // Prepare data string
  String dataString = "pm1_0=" + String(pm1_0,6) + "&pm2_5=" + String(pm2_5, 6) + "&pm10=" + String(pm10, 6) + "&gas_concentration=" + String(gasConcentration);

  // Send data to server
  WiFiClient client;
  if (client.connect(serverAddress, serverPort)) {
    client.print("GET /?data=" + dataString + " HTTP/1.1\r\n");
    client.print("Host: " + serverAddress + "\r\n");
    client.print("\r\n");

    // Read response from server
    while (client.available()) {
      char c = client.read();
      Serial.print(c);
    }

    client.stop();
  } else {
    Serial.println("Failed to connect to server");
  }
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("PM1.0:");
  lcd.print(pm1_0);
  lcd.print("µg/m³");
  lcd.setCursor(0, 1);
  lcd.print("PM2.5:");
  lcd.print(pm2_5);
  lcd.print("µg/m³");
  lcd.print("gas_concentration:");
  lcd.print(gas_concentration);
  lcd.print("ppm");

  delay(1000);
}
