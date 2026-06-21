# UPEA Vota

Sistema de votacion universitaria con frontend React, backend FastAPI, Supabase y validacion facial.

## Tecnologias

- Frontend: React, TypeScript, Vite, TailwindCSS, Framer Motion, Recharts.
- Backend: FastAPI, Supabase, JWT, face_recognition/dlib, Pillow.
- Base de datos: Supabase PostgreSQL, Auth y Storage.

## Estructura

```text
src/                 Frontend React
app/                 Backend FastAPI
public/              Archivos publicos del frontend
supabase_schema.sql  Esquema recomendado de base de datos
requirements.txt     Dependencias Python
package.json         Scripts y dependencias frontend
```

## Variables de entorno

Crea un archivo `.env` en la raiz del proyecto:

```env
SUPABASE_URL=https://TU-PROYECTO.supabase.co
SUPABASE_KEY=TU_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=TU_SERVICE_ROLE_KEY
JWT_SECRET=CAMBIA_ESTA_CLAVE_LARGA_Y_SEGURA
FACE_MATCH_THRESHOLD=0.55
VITE_API_URL=http://localhost:8000/api/v1
```

`SUPABASE_SERVICE_ROLE_KEY` solo debe usarse en el backend. No la subas a GitHub.

## Configurar Supabase

1. Crea un proyecto en Supabase.
2. Abre SQL Editor.
3. Ejecuta el archivo `supabase_schema.sql`.
4. Verifica en Storage que existan estos buckets publicos:
   - `photos-estudiantes`
   - `candidates`
5. Registra un usuario desde `/register`.
6. Para convertirlo en admin, ejecuta:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE reg_univ = 'TU_RU';
```

## Ejecutar en desarrollo

Abre dos terminales en la carpeta del proyecto.

Terminal 1, backend:

```powershell
cd C:\Users\brcho\OneDrive\Documentos\INGENIERIA_SOFTWARE\fronted_votacion
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
```

Si PowerShell bloquea el entorno virtual:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
```

Backend local:

```text
http://localhost:8000
http://localhost:8000/docs
```

Terminal 2, frontend:

```powershell
cd C:\Users\brcho\OneDrive\Documentos\INGENIERIA_SOFTWARE\fronted_votacion
npm install
npm run dev
```

Frontend local:

```text
http://localhost:5173/login
```

## Entrar como administrador

Entra por `/login` con:

- Registro Universitario: `reg_univ` del usuario admin.
- Cedula: `id_card` del usuario admin.

Si el perfil tiene `role = 'admin'`, el sistema redirige a `/admin/dashboard`.

## Validar el proyecto

```powershell
npm run lint
npm run build
```

El build ejecuta TypeScript y luego genera `dist`.

## Despliegue del backend en Render

1. Crea un Web Service.
2. Conecta el repositorio.
3. Configura:

```text
Build Command: pip install -r requirements.txt
Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

4. Agrega variables de entorno:

```env
SUPABASE_URL=
SUPABASE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=
FACE_MATCH_THRESHOLD=0.55
CORS_ORIGINS=https://TU-FRONTEND.vercel.app
```

## Despliegue del frontend en Vercel o Netlify

Configura:

```text
Build Command: npm run build
Publish Directory: dist
```

Variable de entorno:

```env
VITE_API_URL=https://TU-BACKEND.onrender.com/api/v1
```

Para Netlify, el proyecto ya incluye `public/_redirects` para soportar rutas SPA.

## Notas importantes

- La webcam requiere HTTPS en produccion.
- La primera validacion facial puede tardar un poco porque el modelo se carga bajo demanda.
- El backend actual guarda `user_id` en `votes` para evitar doble voto. Los resultados se consumen agregados, pero si necesitas anonimato electoral estricto conviene separar identidad y sufragio con un flujo criptografico dedicado.
- El bucket correcto para candidatos en este backend es `candidates`.

##Brayan_10099420