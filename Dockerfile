# ---------- Stage 1: Build de la app Vite ----------
FROM node:20-alpine AS build

WORKDIR /app

# Solo los package*.json para instalar deps
COPY package*.json ./

# Instala dependencias
RUN npm ci

# Copia el resto del codigo
COPY . .

# Variables de compilacion para Vite
ARG VITE_API_URL
ARG VITE_ORG_ID
ARG VITE_APP_URL
ARG VITE_GOOGLE_CLIENT_ID

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_ORG_ID=$VITE_ORG_ID
ENV VITE_APP_URL=$VITE_APP_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

# Compila el frontend para produccion
RUN npm run build

# ---------- Stage 2: Imagen final para servir estaticos ----------
FROM node:20-alpine

WORKDIR /app

# Servidor estatico muy simple
RUN npm install -g serve

# Copiamos el build del primer stage
COPY --from=build /app/dist ./dist

# Cloud Run inyecta PORT, aqui solo lo usamos
ENV PORT=8080

# Comando de arranque
CMD ["sh", "-c", "serve -s dist -l $PORT"]
