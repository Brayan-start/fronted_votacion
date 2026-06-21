# Guía de Despliegue — UPEA Vota

Sistema de Votación Electrónica Universitaria

---

## Índice

1. [Requisitos previos](#1-requisitos-previos)
2. [Clonar el repositorio](#2-clonar-el-repositorio)
3. [Instalación de dependencias](#3-instalación-de-dependencias)
4. [Configuración de variables de entorno](#4-configuración-de-variables-de-entorno)
5. [Configuración de la base de datos (Supabase)](#5-configuración-de-la-base-de-datos-supabase)
6. [Configuración de reCAPTCHA en producción](#6-configuración-de-recaptcha-en-producción)
7. [Configuración del envío de correos electrónicos](#7-configuración-del-envío-de-correos-electrónicos)
8. [Configuración de HTTPS y buenas prácticas de seguridad](#8-configuración-de-https-y-buenas-prácticas-de-seguridad)
9. [Desplegar el backend en Render](#9-desplegar-el-backend-en-render)
10. [Desplegar el frontend en Vercel](#10-desplegar-el-frontend-en-vercel)
11. [Alternativas gratuitas de despliegue](#11-alternativas-gratuitas-de-despliegue)
12. [Cómo configurar las variables de entorno en cada plataforma](#12-cómo-configurar-las-variables-de-entorno-en-cada-plataforma)
13. [Migraciones de la base de datos](#13-migraciones-de-la-base-de-datos)
14. [Verificar que el sistema funciona correctamente](#14-verificar-que-el-sistema-funciona-correctamente)
15. [Solución de errores comunes](#15-solución-de-errores-comunes)
16. [Recomendaciones de seguridad para producción](#16-recomendaciones-de-seguridad-para-producción)
17. [Actualizar el sistema con nuevos cambios](#17-actualizar-el-sistema-con-nuevos-cambios)
18. [Copias de seguridad de la base de datos](#18-copias-de-seguridad-de-la-base-de-datos)

---

## 1. Requisitos previos

Antes de comenzar, necesitas tener instalado en tu computadora:

- **Git** — para clonar el repositorio ([descargar](https://git-scm.com/downloads))
- **Node.js 18+** — para construir el frontend ([descargar](https://nodejs.org/))
- **Python 3.10+** — para el backend ([descargar](https://www.python.org/downloads/))
- **pip** — normalmente viene con Python, verifica con `pip --version`

Además, necesitarás crear cuentas gratuitas en:

- **GitHub** — para alojar el código ([github.com](https://github.com))
- **Supabase** — para la base de datos y almacenamiento ([supabase.com](https://supabase.com))
- **Vercel** — para desplegar el frontend ([vercel.com](https://vercel.com))
- **Render** — para desplegar el backend ([render.com](https://render.com))

Tiempo estimado total: **30–45 minutos**.

---

## 2. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/fronted_votacion.git
cd fronted_votacion
```

Esto crea una carpeta llamada `fronted_votacion` con todo el código del proyecto.

---

## 3. Instalación de dependencias

### Backend (Python)

```bash
python -m venv venv

# Activar en Windows:
venv\Scripts\activate

# Activar en Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

Esto instala: FastAPI, Uvicorn, Supabase SDK, JWT, bcrypt, OpenCV, face_recognition y más.

> **Nota sobre face_recognition**: Requiere `dlib`. En Windows puede ser problemático; usa:
> ```bash
> pip install dlib-bin
> pip install face_recognition
> ```
> En Render la compilación funciona automáticamente.

### Frontend (React + Vite)

```bash
npm install
```

Esto instala: React 19, React Router, Axios, jsPDF, QRCode, Framer Motion, Tailwind CSS y más.

---

## 4. Configuración de variables de entorno

El proyecto usa variables de entorno. **Nunca subas el archivo `.env` a GitHub** (está en `.gitignore`).

### Variables requeridas

| Variable | Descripción | ¿Dónde obtenerla? |
|---|---|---|
| `SUPABASE_URL` | URL de tu proyecto Supabase | Supabase → Project Settings → API |
| `SUPABASE_KEY` | Llave anónima (pública) | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Llave de servicio (secreta) | Supabase → Project Settings → API |
| `JWT_SECRET` | Secreto para firmar tokens JWT | Genera con `openssl rand -hex 32` |
| `CORS_ORIGINS` | URLs permitidas para CORS | `https://tufrontend.vercel.app` |
| `VITE_API_URL` | URL del backend en producción | `https://tu-api.onrender.com/api/v1` |
| `RECAPTCHA_SECRET_KEY` | Secret Key de reCAPTCHA | [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin) |
| `VITE_RECAPTCHA_SITE_KEY` | Site Key de reCAPTCHA | [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin) |

### Variables opcionales

| Variable | Defecto | Descripción |
|---|---|---|
| `FACE_MATCH_THRESHOLD` | `0.55` | Umbral de coincidencia facial |
| `RECAPTCHA_SKIP_VERIFICATION` | `false` | `true` solo para desarrollo |
| `SMTP_SERVER` | `""` | Servidor SMTP para correos |
| `SMTP_PORT` | `587` | Puerto SMTP |
| `SMTP_USER` | `""` | Usuario SMTP |
| `SMTP_PASSWORD` | `""` | Contraseña SMTP |
| `SMTP_FROM_EMAIL` | `noreply@upeavota.com` | Remitente de correos |

### Ejemplo de `.env` para producción

```env
# Supabase
SUPABASE_URL=https://tuproyecto.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...

# JWT — ¡cambia esto por una clave segura!
JWT_SECRET=un_secreto_muy_largo_y_seguro_de_al_menos_32_caracteres

# Backend
CORS_ORIGINS=https://tufrontend.vercel.app
FACE_MATCH_THRESHOLD=0.55

# reCAPTCHA
RECAPTCHA_SECRET_KEY=6Lf..._secret
RECAPTCHA_SKIP_VERIFICATION=false

# SMTP — opcional, para recuperación de contraseña
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-correo@gmail.com
SMTP_PASSWORD=tu-contraseña-de-aplicacion
SMTP_FROM_EMAIL=noreply@upeavota.com

# Frontend (solo se usan en tiempo de construcción)
VITE_API_URL=https://tu-api.onrender.com/api/v1
VITE_RECAPTCHA_SITE_KEY=6Lf..._site
```

---

## 5. Configuración de la base de datos (Supabase)

Supabase es el corazón del sistema. Aquí se almacenan usuarios, elecciones, candidatos, votos y registros de auditoría.

### 5.1 Crear un proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) e inicia sesión.
2. Haz clic en **"New project"**.
3. Elige un nombre (ej. `upea-vota-produccion`).
4. Establece una **contraseña segura para la base de datos** (guárdala).
5. Elige la región más cercana a tus usuarios (ej. `South America (São Paulo)`).
6. Espera 2–3 minutos mientras se crea.

### 5.2 Obtener las credenciales

En el Dashboard de Supabase:

1. Ve a **Project Settings → API**.
2. Copia estos valores:
   - `Project URL` → `SUPABASE_URL`
   - `anon public` → `SUPABASE_KEY`
   - `service_role` (¡secreta!) → `SUPABASE_SERVICE_ROLE_KEY`

### 5.3 Ejecutar el esquema de base de datos

1. En Supabase Dashboard, ve a **SQL Editor**.
2. Haz clic en **"New query"**.
3. Abre el archivo `supabase_schema.sql` del proyecto y copia todo su contenido.
4. Pégalo en el editor y haz clic en **"Run"**.
5. Verifica que no haya errores.

Este script crea automáticamente:
- **Tablas**: profiles, elections, categories, candidates, face_embeddings, votes, password_reset_codes, audit_logs
- **Trigger**: crea automáticamente un perfil cuando alguien se registra
- **RLS Policies**: seguridad a nivel de fila
- **Índices**: para búsquedas rápidas
- **Buckets de Storage**: `photos-estudiantes` y `candidates`
- **Vista**: `vote_results` para resultados agregados

### 5.4 Verificar los buckets de almacenamiento

1. Ve a **Storage** en el panel izquierdo de Supabase.
2. Deberías ver dos buckets: `photos-estudiantes` y `candidates`.
3. Ambos deben tener `Public = ON`.

### 5.5 Crear un usuario administrador

Después del despliegue, cuando te registres por primera vez, ejecuta en SQL Editor:

```sql
UPDATE public.profiles SET role = 'admin' WHERE reg_univ = 'TU_RU';
```

Reemplaza `TU_RU` con tu número de registro universitario.

---

## 6. Configuración de reCAPTCHA en producción

### 6.1 Obtener llaves de Google

1. Ve a [https://www.google.com/recaptcha/admin](https://www.google.com/recaptcha/admin).
2. Inicia sesión con tu cuenta de Google.
3. Haz clic en **"Crear"** o **"Create"**.
4. Configura:
   - **Label**: `UPEA Vota Producción`
   - **Tipo**: `reCAPTCHA v2` → **"No soy un robot"**
   - **Dominios**: Añade tu dominio de producción y `localhost`
5. Acepta los términos y guarda.

### 6.2 Configurar en el proyecto

- **Site Key** → `VITE_RECAPTCHA_SITE_KEY`
- **Secret Key** → `RECAPTCHA_SECRET_KEY`

Asegúrate de que `RECAPTCHA_SKIP_VERIFICATION` esté en `false`:

```env
RECAPTCHA_SKIP_VERIFICATION=false
```

> Sin reCAPTCHA configurado, el login fallará para todos los usuarios.

---

## 7. Configuración del envío de correos electrónicos

### Usando Gmail (gratis)

1. Ve a [https://myaccount.google.com/security](https://myaccount.google.com/security).
2. Activa la **Verificación en dos pasos**.
3. Ve a **"Contraseñas de aplicaciones"**.
4. Crea una para "Otra aplicación", nómbrala "UPEA Vota".
5. Copia la contraseña generada (16 caracteres).

Configura:

```env
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-correo@gmail.com
SMTP_PASSWORD=contraseña-de-aplicacion
SMTP_FROM_EMAIL=upeavota@gmail.com
```

> Si los correos no llegan, revisa la carpeta de spam. Sin SMTP configurado, la recuperación de contraseña no funcionará.

---

## 8. Configuración de HTTPS y buenas prácticas de seguridad

### HTTPS

- **Vercel**: HTTPS automático por defecto.
- **Render**: HTTPS automático en dominios `onrender.com`.
- **Supabase**: HTTPS incluido.

### Seguridad en producción

1. **JWT_SECRET**: Genera una clave larga y aleatoria:
   ```bash
   python -c "import secrets; print(secrets.token_hex(32))"
   ```

2. **CORS**: No uses `*` en producción. Especifica el dominio exacto:
   ```env
   CORS_ORIGINS=https://tufrontend.vercel.app
   ```

3. **SUPABASE_SERVICE_ROLE_KEY**: Esta llave tiene acceso total a tu base de datos. **Nunca la expongas en el frontend ni la subas a GitHub.**

4. **Contraseñas**: El sistema usa bcrypt para hashear contraseñas. Los tokens JWT expiran después de 24 horas.

5. **FACE_MATCH_THRESHOLD**: Valor recomendado `0.55`. Menor = más estricto, mayor = más permisivo.

---

## 9. Desplegar el backend en Render

### 9.1 Preparar el repositorio en GitHub

```bash
git init
git add .
git commit -m "Inicializar proyecto UPEA Vota"
git branch -M main
git remote add origin https://github.com/tu-usuario/tu-repositorio.git
git push -u origin main
```

### 9.2 Crear el Web Service en Render

1. Ve a [render.com](https://render.com) e inicia sesión (puedes usar GitHub).
2. Haz clic en **"New +"** → **"Web Service"**.
3. Conecta tu repositorio de GitHub.
4. Configura el servicio:

| Campo | Valor |
|---|---|
| **Name** | `upea-vota-api` |
| **Region** | `South America (São Paulo)` |
| **Branch** | `main` |
| **Runtime** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| **Plan** | `Free` |

5. Haz clic en **"Advanced"** y agrega las variables de entorno:

| Variable | Valor |
|---|---|
| `SUPABASE_URL` | `https://tuproyecto.supabase.co` |
| `SUPABASE_KEY` | `eyJ...` (anon key) |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` (service_role key) |
| `JWT_SECRET` | `tu_clave_secreta_generada` |
| `CORS_ORIGINS` | `https://tufrontend.vercel.app` |
| `RECAPTCHA_SECRET_KEY` | `6Lf...` |
| `RECAPTCHA_SKIP_VERIFICATION` | `false` |
| `FACE_MATCH_THRESHOLD` | `0.55` |
| `SMTP_SERVER` | (opcional) |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | (opcional) |
| `SMTP_PASSWORD` | (opcional) |
| `SMTP_FROM_EMAIL` | (opcional) |

6. Haz clic en **"Deploy Web Service"**.

Render tardará 2–5 minutos. Al terminar, verás una URL como:
```
https://upea-vota-api.onrender.com
```

Pruébala en tu navegador; deberías ver:
```json
{"message": "Bienvenido a la API de UPEA Vota", "status": "online", "version": "1.0.0"}
```

### 9.3 Solucionar problemas con face_recognition en Render

Si el build falla por `dlib` o `face_recognition`, Render usa Ubuntu y debería compilarse. Si el build excede los 15 minutos (límite gratuito):

1. Elimina `face_recognition` y `opencv-python-headless` del `requirements.txt`.
2. La validación facial dejará de funcionar, pero el resto del sistema seguirá operativo.
3. Como alternativa, usa `pip install --no-cache-dir -r requirements.txt` en el Build Command.

---

## 10. Desplegar el frontend en Vercel

**Vercel** es la plataforma recomendada porque:
- **Gratuita** para proyectos personales.
- **HTTPS automático** sin configuración.
- **CDN global** con baja latencia.
- **Despliegue automático** desde GitHub.
- **Soporte nativo para SPA** — no requiere configuración de redirects.

### 10.1 Desplegar en Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión con GitHub.
2. Haz clic en **"Add New..."** → **"Project"**.
3. Conecta tu repositorio de GitHub.
4. Configura el proyecto:

| Campo | Valor |
|---|---|
| **Framework Preset** | `Vite` (se detecta automáticamente) |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Root Directory** | `./` (raíz del repositorio) |

5. En **"Environment Variables"**, agrega:

| Variable | Valor |
|---|---|
| `VITE_API_URL` | `https://tu-api.onrender.com/api/v1` |
| `VITE_RECAPTCHA_SITE_KEY` | `6Lf...` (site key de Google) |

6. Haz clic en **"Deploy"**.

Al terminar, Vercel te dará una URL como:
```
https://fronted-votacion.vercel.app
```

### 10.2 Configurar SPA Routing

Vercel maneja automáticamente las rutas SPA, por lo que **no necesitas ningún archivo adicional**. Si usas Netlify, el proyecto ya incluye `public/_redirects`:

```
/*    /index.html    200
```

---

## 11. Alternativas gratuitas de despliegue

### Frontend

| Plataforma | Pros | Contras |
|---|---|---|
| **Vercel** ★ | SPA nativo, CDN global, HTTPS gratis, fácil | Ninguna relevante |
| **Netlify** | Similar a Vercel, más años en el mercado | Ligeramente más lento en builds |
| **Cloudflare Pages** | CDN más rápido del mundo, 500 builds/mes | Menos integraciones |
| **GitHub Pages** | Gratuito, sin límite de ancho de banda | No soporta SPA routing fácilmente |

**Recomendación**: **Vercel** por su simplicidad, velocidad y soporte nativo para Vite.

### Backend

| Plataforma | Pros | Contras |
|---|---|---|
| **Render** ★ | PostgreSQL incluido (Free), HTTPS, fácil | Build lento en Free, se duerme tras 15 min de inactividad |
| **Railway** | Más rápido que Render, 500h/mes gratis | Créditos limitados |
| **Fly.io** | 3 apps gratis con 256MB RAM, región flexible | Configuración más compleja |
| **PythonAnywhere** | 1 app web gratis, consola Python | Sin PostgreSQL gratis, limitado |

**Recomendación**: **Render** porque es el más sencillo de configurar para FastAPI.

### Base de datos

| Plataforma | Pros | Contras |
|---|---|---|
| **Supabase** ★ | PostgreSQL + Storage + Auth, 500MB gratis | 2 proyectos gratis |
| **Neon** | PostgreSQL serverless, 0.5GB gratis | Sin storage de archivos |
| **Railway PostgreSQL** | 1GB gratis, rápido | Sin dashboard web |

**Recomendación**: **Supabase** porque el proyecto ya está diseñado para usarlo (integración directa, storage, auth).

---

## 12. Cómo configurar las variables de entorno en cada plataforma

### En Render (backend)

1. En tu Dashboard de Render, ve a tu Web Service.
2. Haz clic en **"Environment"** en el menú izquierdo.
3. Haz clic en **"Add Environment Variable"**.
4. Agrega cada variable una por una.
5. Haz clic en **"Save Changes"**.
6. Render se reiniciará automáticamente.

Importante: En Render **no uses** un archivo `.env`. Render ignora los archivos locales. Las variables se configuran desde el Dashboard.

### En Vercel (frontend)

1. En tu Dashboard de Vercel, ve a tu proyecto.
2. Haz clic en **"Settings"** → **"Environment Variables"**.
3. Agrega cada variable:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://tu-api.onrender.com/api/v1`
4. Haz clic en **"Add"**.
5. Ve a **"Deployments"** y haz clic en **"Redeploy"** para aplicar los cambios.

Importante: Las variables `VITE_*` se inyectan en tiempo de **construcción** (build), no en tiempo de ejecución. Por eso necesitas redeploy después de cambiarlas.

---

## 13. Migraciones de la base de datos

Este proyecto **no usa un sistema de migraciones automáticas** (como Alembic o Prisma). Los cambios se aplican manualmente mediante scripts SQL.

### Aplicar cambios nuevos

1. Abre el archivo `supabase_schema.sql` en el proyecto.
2. Identifica las tablas o cambios nuevos (comparando con lo que ya tienes en Supabase).
3. Ve a Supabase → **SQL Editor**.
4. Ejecuta solo los comandos nuevos (CREATE TABLE, ALTER TABLE, ADD COLUMN, etc.).

### Ejemplo: Agregar una columna

```sql
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS telefono TEXT;
```

### Estrategia recomendada

Para mantener el esquema sincronizado:

1. Siempre que agregues una tabla o columna, actualiza `supabase_schema.sql`.
2. Crea scripts SQL incrementales con nombres como:
   - `migracion_001_nueva_columna.sql`
   - `migracion_002_nueva_tabla.sql`
3. Ejecútalos en orden en Supabase SQL Editor.

---

## 14. Verificar que el sistema funciona correctamente

### Backend

```bash
# Verificar que la API responde
curl https://tu-api.onrender.com/

# Deberías ver:
# {"message": "Bienvenido a la API de UPEA Vota", "status": "online", "version": "1.0.0"}

# Verificar que la documentación de la API carga
# Abrir en navegador: https://tu-api.onrender.com/docs
```

### Frontend

1. Abre la URL del frontend (`https://fronted-votacion.vercel.app`).
2. Deberías ver la página de Landing.
3. Haz clic en **"Iniciar Sesión"**.
4. Deberías ver el formulario de login con el reCAPTCHA.
5. Si el login funciona, el sistema está completo.

### Base de datos

```sql
-- Verificar que hay tablas
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Verificar que el trigger de perfil funciona (después de registrar un usuario)
SELECT * FROM public.profiles;

-- Verificar los buckets de storage
SELECT * FROM storage.buckets;
```

### Checklist de verificación

- [ ] La URL raíz del backend responde con JSON
- [ ] La documentación en `/docs` carga
- [ ] El frontend carga sin errores en consola
- [ ] El reCAPTCHA se muestra en el login
- [ ] Un usuario puede registrarse
- [ ] Un usuario puede iniciar sesión
- [ ] Un administrador puede crear elecciones y candidatos
- [ ] Un estudiante puede emitir un voto
- [ ] El historial de votos se muestra
- [ ] El carnet de sufragio se puede descargar
- [ ] La recuperación de contraseña funciona (si configuraste SMTP)

---

## 15. Solución de errores comunes

### Error: "La verificación de seguridad no fue superada"

**Causa**: reCAPTCHA no configurado o llaves incorrectas.

**Solución**:
- Verifica que `RECAPTCHA_SECRET_KEY` y `VITE_RECAPTCHA_SITE_KEY` estén configuradas.
- Temporalmente puedes activar `RECAPTCHA_SKIP_VERIFICATION=true` para probar.

### Error: "No se pudo validar el token"

**Causa**: JWT_SECRET diferente entre sesiones o token expirado.

**Solución**:
- Si cambiaste `JWT_SECRET` después de que los usuarios iniciaron sesión, deben volver a iniciar sesión.
- Los tokens expiran después de 24 horas.

### Error: "Conexión rechazada" al conectar frontend con backend

**Causa**: `VITE_API_URL` apunta a la URL incorrecta.

**Solución**:
- Verifica que `VITE_API_URL` incluya el prefijo `/api/v1`.
- Ejemplo correcto: `https://tu-api.onrender.com/api/v1`

### Error: Backend no responde (502 Bad Gateway)

**Causa**: En Render Free, el servicio se "duerme" después de 15 minutos sin actividad.

**Solución**:
- Espera 30 segundos y recarga. Render lo despierta automáticamente.
- Para mantenerlo activo, usa un servicio como [uptimerobot.com](https://uptimerobot.com) que haga ping cada 10 minutos.

### Error: "No se pudo subir la imagen"

**Causa**: Los buckets de Storage no existen en Supabase.

**Solución**:
- Ve a Supabase → Storage y crea los buckets `photos-estudiantes` y `candidates` como públicos.

### Error: face_recognition falla al instalar

**Causa**: dlib no se compila correctamente.

**Solución**:
- En Windows: `pip install dlib-bin` primero.
- En Render: si el build excede 15 minutos, elimina `face_recognition` del requirements.txt.

---

## 16. Recomendaciones de seguridad para producción

1. **Cambia JWT_SECRET**: Usa una clave generada aleatoriamente (mínimo 32 caracteres).

2. **CORS restringido**: No uses `*`. Especifica solo los dominios que necesitas.

3. **reCAPTCHA obligatorio**: Asegúrate de que `RECAPTCHA_SKIP_VERIFICATION=false`.

4. **Service Role Key**: Protégela como una contraseña. Nunca la compartas ni la expongas.

5. **HTTPS**: Todas las plataformas recomendadas lo usan por defecto. Verifica que no haya contenido mixto (HTTP + HTTPS).

6. **Contraseñas seguras**: El CI del estudiante se usa como contraseña inicial. Recomienda a los usuarios cambiar la contraseña después del primer inicio.

7. **Logs**: El sistema registra eventos de auditoría. Revisa periódicamente los logs en el panel de Administración → Auditoría.

8. **Rate limiting**: El endpoint de recuperación de contraseña tiene un límite de 3 solicitudes por hora por email.

9. **Respaldos**: Programa copias de seguridad semanales de Supabase (ver sección 18).

10. **Actualizaciones**: Mantén las dependencias actualizadas para evitar vulnerabilidades conocidas.

---

## 17. Actualizar el sistema con nuevos cambios

Cuando hagas cambios en el código local y quieras desplegarlos:

### 1. Subir cambios a GitHub

```bash
git add .
git commit -m "Descripción de los cambios realizados"
git push origin main
```

### 2. Render (backend) se actualiza automáticamente

Render detecta el push a GitHub y automáticamente:
1. Construye el nuevo código.
2. Instala dependencias nuevas si las hay.
3. Reinicia el servicio.

El proceso tarda 2–5 minutos. Durante ese tiempo, el backend puede no responder.

### 3. Vercel (frontend) se actualiza automáticamente

Vercel detecta el push y:
1. Construye el frontend con `npm run build`.
2. Despliega la nueva versión.

El proceso tarda 1–2 minutos. Vercel maneja la transición sin tiempo de inactividad.

### 4. Migraciones de base de datos (si aplica)

Si agregaste nuevas tablas o columnas:
1. Ve a Supabase → SQL Editor.
2. Ejecuta solo los comandos nuevos (CREATE TABLE, ALTER TABLE, etc.).
3. Verifica que no haya errores.

### 5. Verificar después de la actualización

- Abre el frontend y verifica que cargue sin errores.
- Prueba las funcionalidades afectadas por los cambios.
- Revisa la consola del navegador (F12) en busca de errores.

---

## 18. Copias de seguridad de la base de datos

### Opción 1: Supabase Dashboard (recomendada)

Supabase hace **copias de seguridad automáticas diarias** en los planes pagos. En el plan gratuito no hay backups automáticos.

### Opción 2: Exportación manual desde Supabase

1. Ve a Supabase Dashboard → **Database** → **"Create backup"**.
2. Haz clic en **"Export"**.
3. Descarga el archivo `.sql`.

### Opción 3: Usar pg_dump (requiere conexión directa)

```bash
# Obtener la cadena de conexión de Supabase:
# Database → Connection string → URI

pg_dump "postgresql://postgres:TU_CONTRASENA@db.tuproyecto.supabase.co:5432/postgres" > backup_$(date +%Y%m%d).sql
```

### Opción 4: Automatizar con script (Linux/Mac)

Crea un archivo `backup.sh`:

```bash
#!/bin/bash
DB_URL="postgresql://postgres:TU_CONTRASENA@db.tuproyecto.supabase.co:5432/postgres"
BACKUP_DIR="/ruta/de/respaldo"
DATE=$(date +%Y%m%d_%H%M%S)

pg_dump "$DB_URL" > "$BACKUP_DIR/upeavota_$DATE.sql"
gzip "$BACKUP_DIR/upeavota_$DATE.sql"

# Eliminar backups más antiguos de 30 días
find "$BACKUP_DIR" -name "upeavota_*.sql.gz" -mtime +30 -delete

echo "Backup completado: upeavota_$DATE.sql.gz"
```

Programa una tarea semanal:

```bash
crontab -e
# Agrega esta línea (se ejecuta cada domingo a las 3 AM):
0 3 * * 0 /ruta/del/backup.sh
```

### Restaurar un backup

```bash
# En Supabase SQL Editor, abre el archivo .sql y ejecuta todo su contenido.
# O desde terminal:
psql "postgresql://postgres:TU_CONTRASENA@db.tuproyecto.supabase.co:5432/postgres" < backup_20250101.sql
```

> **Advertencia**: Restaurar un backup reemplaza todos los datos actuales. Asegúrate de que es lo que quieres hacer.

---

## Recomendación final: Plataforma ideal para este proyecto

| Componente | Plataforma | Plan gratuito | ¿Por qué? |
|---|---|---|---|
| **Frontend** | Vercel | Sí | CDN global, HTTPS gratis, SPA nativo, builds rápidos |
| **Backend** | Render | Sí | Soporta Python/FastAPI, HTTPS gratis, despliegue desde GitHub |
| **Base de datos** | Supabase | Sí | PostgreSQL 500MB, Storage 1GB, Auth incluido, API en tiempo real |

**Costo total mensual: $0 USD** — las tres plataformas tienen planes gratuitos suficientes para un proyecto universitario.

### Limitaciones del plan gratuito a considerar

- **Render Free**: El servicio se duerme después de 15 minutos sin actividad. La primera solicitud después de inactividad tarda 30–60 segundos.
- **Supabase Free**: 500MB de base de datos, 1GB de storage, 2 proyectos máximo.
- **Vercel Free**: 100GB de ancho de banda, 6000 minutos de build por mes.

Para evitar que Render se duerma, puedes usar [UptimeRobot](https://uptimerobot.com) (gratis) para hacer ping a tu API cada 10 minutos.
