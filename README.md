# EPaper Management System

EPaper Management System manages ESP32-driven, seven-color e-paper displays. It combines a React dashboard, a FastAPI service, MongoDB storage, MQTT delivery, and firmware that retrieves display-ready pixel data over HTTP.

## Features

- Registers ESP32 devices by MAC address and manages their names through the dashboard.
- Schedules content for one or more displays at a specified date and time.
- Supports uploaded images, rendered text, and the `clear` and `qrcode` device commands.
- Normalizes image content to an `800 × 480` canvas.
- Converts images to a seven-color palette: black, white, green, blue, red, yellow, and orange.
- Previews scheduled content in the event management interface.
- Provides a browser canvas with pencil, eraser, line, rectangle, ellipse, text, color, brush-size, and PNG download controls.
- Provisions device Wi-Fi connections through WiFiManager.

## System Overview

| Component | Responsibility |
| --- | --- |
| `Interface` | React and TypeScript dashboard for devices, schedules, previews, and canvas editing |
| `API` | FastAPI endpoints, event scheduling, image processing, MongoDB access, and MQTT publishing |
| MongoDB | Stores devices, modes, and scheduled events |
| MQTT broker | Delivers event notifications to targeted ESP32 devices |
| `ePaper` | ESP32 firmware for Wi-Fi provisioning, device registration, MQTT reception, and display rendering |

The event flow is:

1. The ESP32 connects to Wi-Fi, registers its MAC address with the API, and subscribes to `ePaper/send`.
2. The dashboard stores devices and scheduled events through the API.
3. The API checks MongoDB for events matching the current timestamp.
4. When an event is due, the API publishes its target MAC addresses, mode, and content identifier over MQTT.
5. A matching device requests the converted pixel stream from `/api/ePaper/image/{image}` and renders it on the display.

## Requirements

### Web interface

- Node.js `24.22.0` LTS
- npm `11.19.1`
- React `18.2.0`
- React Scripts `5.0.1`
- TypeScript `^4.4.2`
- Material UI `^5.14.2`

### API

- Python `3.12`
- FastAPI `0.143.1`
- Uvicorn `0.53.0`
- MongoDB with PyMongo `4.18.3`
- An MQTT broker with Paho MQTT `2.1.0`
- Pillow `12.3.0`, NumPy `2.5.4`, and OpenCV `5.0.0.93`
- python-dotenv `1.2.4`
- python-multipart `0.0.32`

Python dependencies are pinned in `API/requirements.txt`.

### Firmware

- An ESP32 board
- A display using the `GxEPD2_730c_GDEY073D46` driver
- ArduinoJson
- GxEPD2
- PubSubClient
- WiFiManager
- ESP32 Arduino core libraries

The firmware configures the display with `SS` as chip select, GPIO `17` for data/command, GPIO `16` for reset, and GPIO `4` for busy. GPIO `0` starts the Wi-Fi configuration portal.

## Configuration

### API environment

Create `API/.env` with the following keys:

```dotenv
IP=<api-bind-address>
PORT=5000
DB_HOST=<mongodb-host>
DB_PORT=<mongodb-port>
MQTT_HOST=<mqtt-broker-host>
MQTT_PORT=1883
```

Run the API from the `API` directory. Its image and font paths are relative to that working directory.

### Interface environment

Copy `Interface/.env.example` to `Interface/.env`:

```dotenv
REACT_APP_HOST=<api-host>
REACT_APP_PORT=5000
```

The host must be reachable from the browser running the dashboard.

### Firmware network settings

Update these values before compiling the firmware:

| File | Setting | Purpose |
| --- | --- | --- |
| `ePaper/Display.cpp` | `SERVER_HOST` | FastAPI server address |
| `ePaper/Display.cpp` | `SERVER_PORT` | FastAPI server port; currently `5000` |
| `ePaper/MQTT.h` | `MQTT_HOST` | MQTT broker address |
| `ePaper/MQTT.h` | `MQTT_PORT` | MQTT broker port; currently `1883` |
| `ePaper/MQTT.h` | `MQTT_TOPIC` | MQTT topic; currently `ePaper/send` |
| `ePaper/MQTT.h` | `MQTT_USER`, `MQTT_PASSWORD` | Broker credentials; currently empty |

The API, browser, MQTT broker, and ESP32 devices must be able to reach the configured addresses.

## Local Setup

### Start the API

Start MongoDB and the MQTT broker first. Then run:

```bash
cd API
python -m pip install -r requirements.txt
python main.py
```

### Start the interface

In a separate terminal:

```bash
cd Interface
npm install
npm start
```

The package also defines the following commands:

```bash
npm run build
npm test
```

### Upload the firmware

Open `ePaper/ePaper.ino` in an ESP32-compatible Arduino environment, configure the API and MQTT addresses, install the required libraries, and compile and upload the sketch.

On startup, the device:

1. Opens the `ESP32AP` Wi-Fi configuration portal when stored network settings are unavailable.
2. Registers its MAC address with the API.
3. Connects to the MQTT broker.
4. Requests and displays the `START` image.

## API Overview

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/device/get` | List registered devices |
| `POST` | `/api/device/create` | Register a device |
| `PUT` | `/api/device/update` | Rename a device |
| `DELETE` | `/api/device/remove` | Remove a device |
| `GET` | `/api/event/get` | List active events with preview images |
| `POST` | `/api/event/create` | Create a text, image, or command event |
| `PUT` | `/api/event/update` | Update an existing event |
| `DELETE` | `/api/event/remove` | Mark an event as inactive |
| `GET` | `/api/mode/get` | Load event modes from MongoDB |
| `GET` | `/api/ePaper/image/{image}` | Return a serialized seven-color pixel stream |

## Repository Structure

```text
EPaper-Management-System/
├── API/
│   ├── api/            # FastAPI route handlers
│   ├── fonts/          # Font used for server-side text rendering
│   ├── functions/      # Database, scheduling, MQTT, and image logic
│   └── main.py         # API entry point and scheduling worker
├── Interface/
│   ├── public/         # Static web files
│   ├── src/
│   │   ├── api/        # Browser API clients
│   │   ├── components/ # Event, layout, and canvas components
│   │   ├── functions/  # Canvas drawing implementation
│   │   └── pages/      # Device, event, canvas, and error pages
│   ├── package.json
│   └── tsconfig.json
└── ePaper/
    ├── ePaper.ino      # Firmware entry point
    ├── Display.*       # HTTP image retrieval and display rendering
    ├── Manager.*       # Wi-Fi provisioning and local web server
    └── MQTT.*          # MQTT connection and subscription handling
```

## Third-Party Font

`API/fonts/NotoSansTC-Medium.ttf` is used to render Traditional Chinese text in generated e-paper images.

Noto Sans TC is licensed under the SIL Open Font License 1.1. Copyright © 2014–2021 Adobe, with Reserved Font Name “Source.” See [`API/fonts/OFL.txt`](API/fonts/OFL.txt) for the full license text. The SIL Open Font License applies only to the bundled font.