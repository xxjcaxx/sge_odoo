Sí. La clave es separar build del cliente y build del servidor. Vite ya genera el cliente en dist/; el servidor Node no necesita realmente “compilarse” si es JavaScript, simplemente hay que copiarlo al artefacto de producción.

Una estructura recomendable sería:

project/
├── client/
│   └── ...
├── server/
│   └── index.js
├── package.json
├── package-lock.json
├── vite.config.js
├── Dockerfile
├── docker-compose.yml
└── .dockerignore


Si actualmente tienes el cliente en la raíz y server/ aparte, también sirve.

1. Ajustar package.json

Yo dejaría los scripts así:

{
  "scripts": {
    "dev": "concurrently \"npm:dev:client\" \"npm:dev:server\"",
    "dev:client": "vite",
    "dev:server": "node server/index.js",

    "build:client": "vite build",
    "build:server": "mkdir -p dist-server && cp -r server/* dist-server/",

    "build": "npm run build:client && npm run build:server",

    "preview": "vite preview",
    "server": "node dist-server/index.js",

    "start": "node dist-server/index.js"
  }
}


Pero hay un detalle importante: si tu servidor es JavaScript puro, no necesitas copiarlo a dist-server obligatoriamente. Puedes hacer simplemente:

{
  "scripts": {
    "dev": "concurrently \"npm:dev:client\" \"npm:dev:server\"",
    "dev:client": "vite",
    "dev:server": "node server/index.js",
    "build": "vite build",
    "preview": "vite preview",
    "server": "node server/index.js",
    "start": "node server/index.js"
  }
}


Y construir una imagen Docker que contenga:

/app
├── dist/             ← cliente generado por Vite
├── server/           ← servidor
├── node_modules/
└── package.json


Esta segunda opción es la que te recomiendo si el servidor está escrito en Node.js sin TypeScript/Babel.

2. Lo importante: que Node sirva dist/

Si quieres desplegar un único contenedor, lo habitual es que tu servidor Node sirva también el frontend generado por Vite.

Por ejemplo, si utilizas Express:

const express = require("express");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;

// API
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello" });
});

// Frontend generado por Vite
app.use(express.static(path.join(__dirname, "../dist")));

// SPA fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on port ${PORT}`);
});


Así tienes:

Browser
   │
   ▼
:3000
   │
   ├── /api/...       → Node
   │
   ├── /assets/...    → dist/assets/...
   │
   └── /             → dist/index.html


Esto es bastante más sencillo que levantar Vite en producción.

3. Dockerfile

Puedes utilizar un Dockerfile multi-stage para que la imagen final no tenga las herramientas de desarrollo de Vite.

# =========================
# Build
# =========================
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build


# =========================
# Production
# =========================
FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./

RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server

EXPOSE 3000

CMD ["node", "server/index.js"]


Con esto:

docker build -t mi-app .


y:

docker run -p 3000:3000 mi-app


Tendrías la aplicación disponible en:

http://localhost:3000

4. Docker Compose

Un docker-compose.yml sencillo:

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: mi-app
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      PORT: 3000


Entonces:

docker compose up -d --build


Y para ver logs:

docker compose logs -f app


Para parar:

docker compose down

5. .dockerignore

Muy recomendable:

node_modules
dist
.git
.gitignore
Dockerfile
docker-compose.yml
npm-debug.log
.env
.env.*


Ojo con .env: si necesitas variables de entorno en producción, es mejor pasarlas mediante docker-compose.yml, un archivo .env gestionado por Docker, secrets, o el entorno de despliegue, en lugar de meterlas en la imagen.

6. Un detalle importante con las variables VITE_*

Si tu frontend utiliza cosas como:

const apiUrl = import.meta.env.VITE_API_URL;


esas variables se incorporan durante npm run build, no cuando arranca Node.

Por ejemplo:

services:
  app:
    build:
      context: .
      args:
        VITE_API_URL: https://api.example.com


y en Dockerfile:

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build


Pero si el cliente y servidor están en el mismo dominio, normalmente puedes evitar esto y hacer llamadas relativas:

fetch("/api/hello");


Eso es especialmente cómodo porque la misma aplicación sirve:

https://miapp.com/
https://miapp.com/assets/...
https://miapp.com/api/...

Arquitectura que te recomendaría

Para tu caso, si tienes Vite + Node y quieres una sola aplicación Docker:

                    ┌──────────────────────┐
                    │       Docker         │
                    │                      │
Browser ── :3000 ──►│  Node/Express        │
                    │       │              │
                    │       ├─ /api ───────┤
                    │       │              │
                    │       └─ / ──────────┼──► dist/
                    │                      │
                    └──────────────────────┘


El proceso de despliegue queda simplemente:

docker compose up -d --build


Y no necesitas vite preview en producción ni necesitas ejecutar dos procesos (vite + node). Vite solamente construye el frontend; Node es el único proceso que queda ejecutándose.

Si me pegas tu server/index.js y, si tienes, tu vite.config.js, puedo darte el Dockerfile + compose + scripts exactos para tu proyecto, incluyendo el manejo correcto del dist y del routing SPA.