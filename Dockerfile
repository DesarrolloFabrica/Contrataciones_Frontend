# ---------- Stage 1: Build de la app Vite ----------
FROM node:20-alpine AS build

WORKDIR /app

# Solo los package*.json para instalar deps
COPY package*.json ./

# Instala dependencias
RUN npm ci

# Copia el resto del código
COPY . .

# Compila el frontend para producción
RUN npm run build

# ---------- Stage 2: Imagen final para servir estáticos ----------
FROM node:20-alpine

WORKDIR /app

# Servidor estático muy simple
RUN npm install -g serve

# Copiamos el build del primer stage
COPY --from=build /app/dist ./dist

# Cloud Run inyecta PORT, aquí solo lo usamos
ENV PORT=8080

# Comando de arranque
CMD ["sh", "-c", "serve -s dist -l $PORT"]
