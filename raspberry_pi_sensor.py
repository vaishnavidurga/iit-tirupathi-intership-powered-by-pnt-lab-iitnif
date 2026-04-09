# Raspberry Pi Soil Moisture Monitoring Code
# This code runs on Raspberry Pi to collect sensor data and send to Firebase

import time
import board
import busio
import adafruit_dht
import serial
import firebase_admin
from firebase_admin import credentials, db
from adafruit_mcp3xxx.mcp3008 import MCP3008
from adafruit_mcp3xxx.analog_in import AnalogIn

# Firebase setup
cred = credentials.Certificate('path/to/serviceAccountKey.json')
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://your-project.firebaseio.com/'
})

# Sensor setup
dht_sensor = adafruit_dht.DHT11(board.D23)  # GPIO 23
spi = busio.SPI(clock=board.SCK, MISO=board.MISO, MOSI=board.MOSI)
cs = digitalio.DigitalInOut(board.D5)
mcp = MCP3008(spi, cs)
soil_channel = AnalogIn(mcp, MCP3008.P0)  # Soil moisture on channel 0

# GPS setup
gps_serial = serial.Serial('/dev/ttyS0', 9600, timeout=1)

def get_gps_coordinates():
    """Get GPS coordinates from NEO-6M module"""
    try:
        while True:
            line = gps_serial.readline().decode('utf-8')
            if line.startswith('$GPGGA'):
                data = line.split(',')
                if data[2] and data[4]:
                    lat = float(data[2][:2]) + float(data[2][2:])/60
                    lon = float(data[4][:3]) + float(data[4][3:])/60
                    return lat, lon
    except:
        return None, None

def read_sensors():
    """Read all sensor values"""
    try:
        # Soil moisture (0-1023, convert to percentage)
        soil_moisture = (1023 - soil_channel.value) / 1023 * 100

        # Temperature and humidity
        temperature = dht_sensor.temperature
        humidity = dht_sensor.humidity

        # GPS coordinates
        lat, lon = get_gps_coordinates()

        return {
            'soil_moisture': round(soil_moisture, 2),
            'temperature': temperature,
            'humidity': humidity,
            'latitude': lat,
            'longitude': lon,
            'timestamp': time.time()
        }
    except Exception as e:
        print(f"Error reading sensors: {e}")
        return None

def send_to_firebase(data):
    """Send sensor data to Firebase"""
    try:
        ref = db.reference('sensor_data')
        ref.push(data)
        print("Data sent to Firebase successfully")
    except Exception as e:
        print(f"Error sending to Firebase: {e}")

# Main loop
while True:
    sensor_data = read_sensors()
    if sensor_data:
        print(f"Sensor Data: {sensor_data}")
        send_to_firebase(sensor_data)

    time.sleep(300)  # Send data every 5 minutes