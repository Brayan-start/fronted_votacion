# 📋 Lista de Verificación para Despliegue en Render

Usa esta lista paso a paso para configurar el backend en **Render** y el frontend en **Vercel**. Marca cada casilla a medida que completes cada paso.

---

## 🔧 1. Preparación del Repositorio

- [ ] El repositorio está subido a GitHub (`git push origin main`)
- [ ] El archivo `.env` **NO** está en el repositorio (está en `.gitignore`)
- [ ] El archivo `.env.example` sí está en el repositorio
- [ ] `requirements.txt` tiene todas las dependencias con versiones
- [ ] `runtime.txt` especifica `python-3.11.11`
- [ ] `vercel.json` está en la raíz (para frontend)
- [ ] `render.yaml` está en la raíz (para backend)
- [ ] `index.html` tiene `<html lang="es">` y `<title>UPEA Vota</title>`

---

## 🗄️ 2. Supabase (Base de Datos)

- [ ] Proyecto creado en [supabase.com](https://supabase.com)
- [ ] Región: `South America (São Paulo)`
- [ ] Contraseña de base de datos guardada en un lugar seguro
- [ ] Esquema ejecutado: copiar `supabase_schema.sql` en **SQL Editor**
  - [ ] Tabla `profiles` creada
  - [ ] Tabla `elections` creada
  - [ ] Tabla `categories` creada
  - [ ] Tabla `candidates` creada
  - [ ] Tabla `face_embeddings` creada
  - [ ] Tabla `votes` creada
  - [ ] Tabla `password_reset_codes` creada
  - [ ] Tabla `audit_logs` creada
  - [ ] Trigger `handle_new_user` creado
  - [ ] Vistas e índices creados
- [ ] Buckets de Storage creados:
  - [ ] `photos-estudiantes` (público)
  - [ ] `candidates` (público)
- [ ] Credenciales copiadas de **Project Settings → API**:
  - [ ] `Project URL` → para `SUPABASE_URL`
  - [ ] `anon public` → para `SUPABASE_KEY`
  - [ ] `service_role` → para `SUPABASE_SERVICE_ROLE_KEY`

---

## 🤖 3. Google reCAPTCHA

- [ ] Ir a [google.com/recaptcha/admin](https://www.google.com/recaptcha/admin)
- [ ] Crear una nueva clave **reCAPTCHA v2 → "No soy un robot"**
- [ ] Agregar dominios:
  - [ ] `localhost`
  - [ ] `tu-api.onrender.com`
  - [ ] `tu-frontend.vercel.app`
  - [ ] (otros dominios personalizados)
- [ ] Copiar **Site Key** → para `VITE_RECAPTCHA_SITE_KEY`
- [ ] Copiar **Secret Key** → para `RECAPTCHA_SECRET_KEY`

---

## 📧 4. SMTP (Correos Electrónicos) — Opcional

- [ ] Cuenta de Gmail configurada con verificación en dos pasos
- [ ] Contraseña de aplicación generada en [Google App Passwords](https://myaccount.google.com/apppasswords)
- [ ] Valores listos:
  - [ ] `SMTP_SERVER=smtp.gmail.com`
  - [ ] `SMTP_PORT=587`
  - [ ] `SMTP_USER=tu-correo@gmail.com`
  - [ ] `SMTP_PASSWORD=contraseña-de-aplicacion`
  - [ ] `SMTP_FROM_EMAIL=noreply@upeavota.com`

---

## 🚀 5. Render — Backend

- [ ] Cuenta creada en [render.com](https://render.com) (usar GitHub)
- [ ] **New Web Service** creado
- [ ] Repositorio conectado
- [ ] Configuración del servicio:

| Campo | Valor |
|---|---|
| Name | `upea-vota-api` |
| Region | `South America (São Paulo)` |
| Branch | `main` |
| Runtime | `Python 3` |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT --forwarded-allow-ips '*'` |
| Plan | **Free** |

- [ ] **Variables de entorno configuradas en el Dashboard (NO en .env):**

| Variable | ¿Valor? |
|---|---|
| `SUPABASE_URL` | ✅ |
| `SUPABASE_KEY` | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ |
| `JWT_SECRET` | ✅ (genera con `openssl rand -hex 32`) |
| `CORS_ORIGINS` | ✅ (`https://tu-frontend.vercel.app`) |
| `RECAPTCHA_SECRET_KEY` | ✅ (de Google) |
| `RECAPTCHA_SKIP_VERIFICATION` | `false` |
| `FACE_MATCH_THRESHOLD` | `0.55` |
| `SMTP_SERVER` | ✅ (opcional) |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | ✅ (opcional) |
| `SMTP_PASSWORD` | ✅ (opcional) |
| `SMTP_FROM_EMAIL` | ✅ (opcional) |

- [ ] Despliegue iniciado (esperar 2–5 minutos)
- [ ] Probar: `https://upea-vota-api.onrender.com/` debe responder:
  ```json
  {"message":"Bienvenido a la API de UPEA Vota","status":"online","version":"1.0.0"}
  ```
- [ ] Probar documentación: `https://upea-vota-api.onrender.com/docs`

---

## ⚡ 6. Vercel — Frontend

- [ ] Cuenta creada en [vercel.com](https://vercel.com) (usar GitHub)
- [ ] **New Project** creado
- [ ] Repositorio conectado
- [ ] La configuración se detecta automáticamente (Vite)
- [ ] **Variables de entorno configuradas:**

| Variable | Valor |
|---|---|
| `VITE_API_URL` | `https://tu-api.onrender.com/api/v1` |
| `VITE_RECAPTCHA_SITE_KEY` | (site key de Google) |

- [ ] Despliegue iniciado (esperar 1–2 minutos)
- [ ] Probar que la página carga: `https://tu-proyecto.vercel.app`
- [ ] Probar que el login muestra el reCAPTCHA

---

## ✅ 7. Verificación Post-Despliegue

- [ ] **Landing**: la página principal carga correctamente
- [ ] **Login**: formulario visible con reCAPTCHA
  - [ ] Probar login con credenciales correctas → redirige al dashboard
  - [ ] Probar login con credenciales incorrectas → muestra error
  - [ ] Probar login sin marcar reCAPTCHA → muestra error
- [ ] **Registro**: formulario de registro funciona
- [ ] **Dashboard de estudiante**: carga correctamente
- [ ] **Dashboard de administrador**: carga correctamente (después de cambiar rol)
- [ ] **Elecciones**: crear, editar, eliminar
- [ ] **Categorías**: crear, eliminar
- [ ] **Candidatos**: crear con foto, editar, eliminar
- [ ] **Votación**: flujo completo (seleccionar categoría, candidato, votar)
- [ ] **Historial**: muestra los votos emitidos
- [ ] **Carnet de Sufragio**: se genera y descarga el PDF
- [ ] **Perfil**: editar nombre, apellido, carrera. Subir foto.
- [ ] **Cambio de contraseña**: flujo completo (si SMTP configurado)
- [ ] **Auditoría**: panel de admin muestra registros
- [ ] **Resultados**: panel de admin muestra resultados de elecciones

---

## 🛡️ 8. Seguridad

- [ ] `JWT_SECRET` es una clave aleatoria de ≥32 caracteres
- [ ] `CORS_ORIGINS` NO es `*` (tiene el dominio exacto del frontend)
- [ ] `RECAPTCHA_SKIP_VERIFICATION` es `false`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` nunca se expone al frontend
- [ ] HTTPS activo en Render y Vercel (automático)

---

## 📊 9. Monitoreo

- [ ] Configurar [UptimeRobot](https://uptimerobot.com) gratis para hacer ping cada 10 minutos a:
  ```
  https://upea-vota-api.onrender.com/
  ```
  (Evita que Render Free se duerma por inactividad)

---

## 🔄 10. Copia de seguridad

- [ ] Backup de Supabase programado o manual semanal
  - Supabase Dashboard → Database → Create backup → Export
- [ ] Script de backup creado (opcional)

---

## 🐛 Errores Comunes en el Despliegue

| Síntoma | Causa | Solución |
|---|---|---|
| Build falla con `dlib` | face_recognition no compila | Usar `requirements-no-face.txt` |
| Login falla: "verificación de seguridad" | reCAPTCHA no configurado | Verificar `RECAPTCHA_SECRET_KEY` y `RECAPTCHA_SKIP_VERIFICATION=false` |
| 502 Bad Gateway | Servicio "dormido" en Render Free | Esperar 30s y recargar. Configurar UptimeRobot. |
| Fotos no se suben | Buckets de Storage no existen | Crear `photos-estudiantes` y `candidates` como públicos |
| SPA: ruta directa da 404 | SPA routing no configurado | Verificar `vercel.json` o `public/_redirects` |
| "No se pudo validar el token" | JWT_SECRET cambiado | Los usuarios deben volver a iniciar sesión |
| CORS bloqueado | `CORS_ORIGINS` incorrecto | Verificar que incluye el dominio exacto del frontend |

---

> 📌 **Nota**: Render Free "duerme" el servicio después de 15 minutos sin actividad.
> La primera solicitud después de inactividad tarda 30–60 segundos en responder.
> Usa [UptimeRobot](https://uptimerobot.com) para mantenerlo activo.
