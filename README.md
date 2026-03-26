# Contrataciones CUN — Frontend (`GoogleAIstudio-project`)

Aplicación web (React + Vite) para el flujo de **entrevistas, análisis asistido por IA y gestión de evaluaciones**, segmentada por roles de usuario:

- **Líder (`leader`)**: registra entrevistas, ejecuta el análisis IA y crea evaluaciones
- **Coordinador (`coordinator`)**: revisa evaluaciones de su escuela, compara entrevistas y registra decisión
- **Administrador (`admin`)**: vista ejecutiva, gestión de usuarios, evaluación y dashboard (scope por escuela/programa)

## Arquitectura (alto nivel)

```mermaid
flowchart LR
  browser[Navegador] -->|HTTP JSON + Bearer JWT| api[NestJS Backend]
  browser -->|Gemini API (cliente)| gemini[Google Gemini]
  api --> db[(PostgreSQL)]
```

> Nota: actualmente el análisis IA usa `@google/genai` desde el **cliente** (navegador). Por diseño, cualquier `VITE_*` queda expuesto al frontend.

## Stack

- **React** + **TypeScript**
- **Vite** (dev server / build)
- **React Router** (rutas protegidas por rol)
- **Axios** (cliente API con Bearer token)
- **Gemini**: `@google/genai` (modelo `gemini-2.5-pro`, con `responseSchema`)
- **UI**: `lucide-react`, `framer-motion`
- **Visualización**: `recharts`
- **PDF**: `jspdf` (servicio `src/services/pdfReport.ts`)
- **Auditoría local (UI)**: log en `localStorage` (`cun-audit-log`)

## Rutas (navegación)

Rutas definidas en `src/App.tsx`:

- **`/login`**: login
- **`/change-password`**: cambio de contraseña (protegida)
- **`/leader`**: consola líder
- **`/coordinator`**: consola coordinación
  - `/coordinator/evaluations/:evaluationId`: detalle y decisión
  - `/coordinator/evaluations/:evaluationId/report`: reporte completo (IA)
- **`/admin`**: consola admin (tabs: evaluaciones/usuarios/dashboard)

### Redirección inicial (`/`)

- Sin sesión → `/login`
- Si `user.mustResetPassword=true` → `/change-password`
- Si hay sesión → redirige por rol (`leader` / `coordinator` / `admin`)

## Autenticación (cómo funciona en el frontend)

- Se guarda la sesión en `localStorage` bajo la clave **`cun-auth`**.
- El cliente Axios (`src/services/apiClient.ts`) adjunta `Authorization: Bearer <token>` automáticamente para rutas protegidas.
- El backend valida el JWT y expone `request.user` (role, schoolId, etc.).

## Funcionalidades principales

### Líder (`/leader`)

- **Captura de entrevista** mediante formulario.
- **Análisis IA** con Gemini: genera
  - score global
  - nivel de riesgo
  - resumen ejecutivo
  - análisis por 4 categorías (con corrección de observaciones)
  - mitigaciones y ventana temporal de riesgo
- **Creación de evaluación** en backend (persistiendo `formRawData` + `aiRawJson`).
- **Historial**: abrir evaluaciones previas desde la misma consola.

### Coordinador (`/coordinator`)

- **Lista y filtros** de evaluaciones de su escuela.
  - Carga su escuela/programas desde `GET /schools?includePrograms=true` según `user.schoolId`.
- **Top recomendados**: ranking local por veredicto + score.
- **Detalle por evaluación**: pestañas (entrevista/IA/auditoría/notas/decisión, según UI).
- **Comparación**: disponible cuando hay 2+ entrevistas.

### Admin (`/admin`)

- **Vista ejecutiva por scope** (escuela/programa): KPIs y panel de evaluaciones.
- **Detalle de evaluación** en modal “vista completa” con exportación **PDF**.
- **Gestión de usuarios** (creación, activación/desactivación, etc. vía backend).
- **Dashboard**: panel con gráficas (Recharts) según datos del scope.
- **Auditoría**: existe UI/infra de auditoría local; parte de auditoría global está temporal/comentada en la consola.

## Exportación de PDF

El PDF se genera en el navegador con `jsPDF`:
  - Servicio: `src/services/pdfReport.ts`
  - Incluye branding CUN y secciones del análisis IA.
  - Devuelve `Blob` (útil si luego se sube al backend).

## Configuración (variables de entorno)

### Archivo recomendado

- Desarrollo: crea **`.env.local`** desde **`.env.example`**
  - `.env.example` está diseñado para ser versionado (sin secretos).

### Variables soportadas

- **`VITE_API_URL`**: base URL del backend.
  - Default si no se define: `http://localhost:3001` (ver `src/services/apiClient.ts`).
  - Algunas pantallas usan fallback **`VITE_BACKEND_URL`**.
- **`VITE_GEMINI_API_KEY`**: API key de Gemini para análisis IA (cliente).
  - Si falta, el análisis IA se deshabilita y algunas acciones arrojarán error.
  - **Seguridad**: al ser `VITE_*`, esta key queda expuesta al navegador.
- **`VITE_ORG_ID`**: identificador de organización (se usa en creación de evaluaciones).
- **`VITE_GOOGLE_CLIENT_ID`**: client id (si se integra login Google).
- **`VITE_APP_URL`**: URL pública del frontend (útil en deploy/redirects).

## Cómo correr (desarrollo)

### Prerrequisitos

- Node.js (recomendado Node 20+)

### Instalación

```bash
npm install
```

### Variables de entorno

```bash
copy .env.example .env.local
```

Edita `.env.local` y define, mínimo:

- `VITE_API_URL`
- `VITE_GEMINI_API_KEY` (si necesitas IA en dev)
- `VITE_ORG_ID`

### Levantar en modo desarrollo

```bash
npm run dev
```

Vite corre en `http://localhost:3000` (ver `vite.config.ts`).

### Build + preview

```bash
npm run build
npm run preview
```

## Docker (producción)

El `Dockerfile` hace build de Vite y sirve estáticos con `serve` en el puerto `PORT` (default 8080).

## Troubleshooting

- **401 / No autorizado**:
  - revisa que `cun-auth` exista y contenga `accessToken`.
  - confirma que `VITE_API_URL` apunte al backend correcto.
  - en backend, valida `JWT_SECRET`/expiración.
- **CORS**:
  - el backend valida orígenes; en dev usa `http://localhost:3000`.
  - si cambias puerto/origen, configura `CORS_ORIGIN` en backend.
- **IA no disponible**:
  - define `VITE_GEMINI_API_KEY`.
  - recuerda: la key queda expuesta (diseño actual).

## Seguridad

- No subas `.env.local` ni `.env.production` con secretos.
  - Mantén solo `.env.example` versionado.
  - En despliegue, inyecta variables vía CI/Secrets del entorno.

