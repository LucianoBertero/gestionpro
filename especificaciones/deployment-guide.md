# Guía de Despliegue — GestiónPro (MVP)

> **Costo objetivo**: $0/mes (free tiers)

---

## Arquitectura de Despliegue

```
┌─────────────────────────────────────────────────────────┐
│                    INTERNET                              │
└─────────────────────────────────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
     ┌────────▼────────┐      ┌─────────▼─────────┐
     │    VERCEL       │      │     RAILWAY        │
     │   (Frontend)    │      │     (Backend)      │
     │   Next.js       │      │     NestJS         │
     │   Puerto: 3000  │      │     Puerto: 3001   │
     └────────┬────────┘      └─────────┬─────────┘
              │                         │
              │              ┌──────────┴──────────┐
              │              │                     │
              │    ┌─────────▼─────────┐ ┌─────────▼─────────┐
              │    │     SUPABASE      │ │      UPSTASH      │
              │    │   PostgreSQL      │ │      Redis        │
              │    │   (Free tier)     │ │    (Free tier)    │
              │    └───────────────────┘ └───────────────────┘
              │
              └────► https://tudominio.com (Vercel)
                           │
                           ▼
                    https://api.tudominio.com (Railway)
```

---

## Paso 1: Preparar el Repositorio

### 1.1 Subir a GitHub

```bash
cd E:\estudioBB\gestionpro
git add .
git commit -m "chore: add deployment configs"
git push origin main
```

### 1.2 Generar JWT Secrets para Producción

```bash
# En PowerShell
openssl rand -base64 32  # Access token secret
openssl rand -base64 32  # Refresh token secret
```

---

## Paso 2: Deploy del Backend en Railway

### 2.1 Crear Cuenta en Railway

1. Ir a [railway.app](https://railway.app)
2. Click "Login" → GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Seleccionar tu repo `gestionpro`
5. **Importante**: En settings, cambiar el **Root Directory** a `apps/api`

### 2.2 Configurar Variables de Entorno en Railway

En el dashboard de Railway, ir a la pestaña **Variables** y agregar:

```env
# ── App ──
APP_ENV=production
APP_NAME=GestiónPro
HTTP_PORT=3001
HTTP_HOST=0.0.0.0
APP_DEBUG=false

# ── Database (Supabase) ──
DATABASE_URL=postgresql://postgres.ckuwztzrmlkkapsgdjhe:gestionpro-dev123%21@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=no-verify
DIRECT_URL=postgresql://postgres.ckuwztzrmlkkapsgdjhe:gestionpro-dev123%21@aws-1-sa-east-1.pooler.supabase.com:5432/postgres?sslmode=no-verify

# ── Redis (Upstash) ──
REDIS_URL=rediss://default:gQAAAAAAAaXBAAIgcDJkNDU3MTQ3ZDM2NGM0OTk2OThhZmIxNDMxZDI3OGVkOA@epic-wasp-107969.upstash.io:6379

# ── JWT (GENERAR NUEVOS PARA PROD) ──
AUTH_ACCESS_TOKEN_SECRET=<pegar-aqui-el-secreto-1>
AUTH_REFRESH_TOKEN_SECRET=<pegar-aqui-el-secreto-2>
AUTH_ACCESS_TOKEN_EXP=15m
AUTH_REFRESH_TOKEN_EXP=7d

# ── CORS ──
APP_CORS_ORIGINS=https://tudominio.vercel.app

# ── Seed Admin ──
SEED_ADMIN_EMAIL=admin@estudiobb.com
SEED_ADMIN_PASSWORD=admin123
SEED_ADMIN_USERNAME=SOCIO
```

### 2.3 Configurar Build

En Railway → tu servicio → Settings:

- **Root Directory**: `apps/api`
- **Dockerfile Path**: `Dockerfile`
- **Start Command**: `node dist/main`

Railway detectará el `railway.json` automáticamente.

### 2.4 Obtener la URL del Backend

Una vez deployado, Railway te da una URL como:
```
https://gestionpro-api-xxxxx.up.railway.app
```

**Copiar esta URL** — la necesitás para el frontend.

---

## Paso 3: Deploy del Frontend en Vercel

### 3.1 Crear Cuenta en Vercel

1. Ir a [vercel.com](https://vercel.com)
2. Click "Login" → GitHub
3. Click "Add New..." → "Project"
4. Seleccionar tu repo `gestionpro`

### 3.2 Configurar el Proyecto en Vercel

En el wizard de importación:

- **Framework Preset**: Next.js
- **Root Directory**: `apps/web`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

### 3.3 Configurar Variables de Entorno en Vercel

En Vercel → tu proyecto → Settings → Environment Variables:

```env
NEXT_PUBLIC_API_URL=https://gestionpro-api-xxxxx.up.railway.app/v1
```

**Reemplazar** `xxxxx` con la URL real de Railway.

### 3.4 Deploy

Click "Deploy". Vercel construye y despliega automáticamente.

---

## Paso 4: Verificar

### 4.1 Test del Backend

```bash
# Health check
curl https://gestionpro-api-xxxxx.up.railway.app/health

# Login
curl -X POST https://gestionpro-api-xxxxx.up.railway.app/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@estudiobb.com","password":"admin123"}'
```

### 4.2 Test del Frontend

Abrir `https://tudominio.vercel.app` y hacer login con:
- Email: `admin@estudiobb.com`
- Password: `admin123`

---

## Paso 5: Dominio Custom (Opcional)

### Vercel (Frontend)

1. Vercel → Settings → Domains
2. Agregar `tudominio.com`
3. Configurar DNS:
   - Type: A
   - Name: @
   - Value: 76.76.21.21
4. Type: CNAME
   - Name: www
   - Value: cname.vercel-dns.com

### Railway (Backend)

1. Railway → Settings → Networking
2. Agregar dominio personalizado: `api.tudominio.com`
3. Configurar DNS:
   - Type: CNAME
   - Name: api
   - Value: `gestionpro-api-xxxxx.up.railway.app`

### Actualizar CORS

Una vez configurado el dominio, actualizar en Railway:
```
APP_CORS_ORIGINS=https://tudominio.com,https://www.tudominio.com
```

---

## Variables de Entorno — Referencia Rápida

### Backend (Railway)

| Variable | Valor | Notas |
|----------|-------|-------|
| `APP_ENV` | `production` | |
| `APP_DEBUG` | `false` | |
| `DATABASE_URL` | `postgresql://...` | Supabase pooler |
| `DIRECT_URL` | `postgresql://...` | Supabase directo |
| `REDIS_URL` | `rediss://...` | Upstash |
| `AUTH_ACCESS_TOKEN_SECRET` | `<nuevo>` | Generar con openssl |
| `AUTH_REFRESH_TOKEN_SECRET` | `<nuevo>` | Generar con openssl |
| `AUTH_ACCESS_TOKEN_EXP` | `15m` | |
| `AUTH_REFRESH_TOKEN_EXP` | `7d` | |
| `APP_CORS_ORIGINS` | `https://tudominio.vercel.app` | |
| `SEED_ADMIN_EMAIL` | `admin@estudiobb.com` | |
| `SEED_ADMIN_PASSWORD` | `admin123` | Cambiar después |

### Frontend (Vercel)

| Variable | Valor | Notas |
|----------|-------|-------|
| `NEXT_PUBLIC_API_URL` | `https://api-xxx.up.railway.app/v1` | URL del backend |

---

## Troubleshooting

### Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| `CORS error` | Frontend no está en la lista de CORS | Agregar URL de Vercel en `APP_CORS_ORIGINS` |
| `401 Unauthorized` | JWT secrets diferentes | Verificar que los secrets coincidan |
| `Database connection refused` | DATABASE_URL mal configurado | Verificar connection string de Supabase |
| `Build failed` | Falta variable de entorno | Verificar todas las variables en Vercel/Railway |
| `Seed no se ejecuta` | El entrypoint no llama seed | Railway no ejecuta seed automático, hacerlo manual |

### Ejecutar Seed en Producción

Si el usuario admin no se creó automáticamente:

```bash
# Opción 1: Railway CLI
railway run npm run seed:admin

# Opción 2: Ejecutar desde el dashboard de Railway
# En la pestaña "Deployments" → click en el deploy → "Raw Shell"
# Luego: npm run seed:admin
```

---

## Costos

| Servicio | Tier | Costo | Límites |
|----------|------|-------|---------|
| Vercel | Hobby | $0 | 100GB bandwidth/mes |
| Railway | Free | $0 | $5 crédito/mes (~500 horas) |
| Supabase | Free | $0 | 500MB DB, 1GB storage |
| Upstash | Free | $0 | 10K comandos/día |
| **TOTAL** | | **$0/mes** | |