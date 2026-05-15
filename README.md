# UPEA Vota - Sistema de Votación Universitaria

Este es un sistema completo de votación electrónica diseñado para la Universidad Pública de El Alto (UPEA), que incluye registro de estudiantes, validación biométrica facial y un panel administrativo para gestión y resultados en tiempo real.

## 🚀 Tecnologías

### Frontend
*   **React 19** + **TypeScript**
*   **Vite** (Build tool)
*   **TailwindCSS** (Estilos)
*   **Framer Motion** (Animaciones)
*   **Lucide React** (Iconografía)
*   **Recharts** (Gráficos estadísticos)
*   **Axios** (Peticiones HTTP)

### Backend
*   **Python 3.10+**
*   **FastAPI** (Framework web)
*   **Supabase** (Base de datos PostgreSQL + Auth + Storage)
*   **face_recognition / dlib** (Motor biométrico optimizado para bajos recursos)
*   **Pydantic** (Validación de datos)
*   **JOSE / JWT** (Seguridad de tokens)

## 🛠️ Configuración Inicial

### 1. Supabase (DB & Storage)
1.  Crea un proyecto en [Supabase](https://supabase.com/).
2.  Ejecuta el contenido de `supabase_schema.sql` en el SQL Editor para crear las tablas, índices y vistas.
3.  Crea dos buckets públicos en la sección **Storage**:
    *   `photos-estudiantes`
    *   `photos-candidatos`

### 2. Backend (FastAPI)
1.  Navega a la carpeta del backend.
2.  Crea un entorno virtual: `python -m venv venv` y actívalo.
3.  Instala dependencias: `pip install -r requirements.txt`.
4.  Crea un archivo `.env` basado en el siguiente ejemplo:

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
JWT_SECRET=una-clave-secreta-larga-y-segura
FACE_MATCH_THRESHOLD=0.55
```

5.  Inicia el servidor: `uvicorn app.main:app --reload`

### 3. Frontend (React)
1.  Navega a la carpeta raíz del proyecto.
2.  Instala dependencias: `npm install`.
3.  Configura el archivo `.env`:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

4.  Inicia el modo desarrollo: `npm run dev`

## 📦 Despliegue

### Backend (Render)
*   **Build Command**: `pip install -r requirements.txt`
*   **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
*   **Nota**: El motor biométrico está optimizado para funcionar en el plan gratuito de 512MB RAM de Render mediante *Lazy Loading*.

### Frontend (Netlify / Vercel)
*   **Build Command**: `npm run build`
*   **Publish Directory**: `dist`

## 🔒 Seguridad y Privacidad
*   **Anonimato**: Los votos se registran sin relación directa con la identidad en las consultas de resultados (vía agregaciones SQL).
*   **Anti-Fraude**: Restricciones de unicidad `(user_id, election_id, category_id)` en la base de datos para prevenir doble voto.
*   **Biometría**: Comparación 1:1 obligatoria antes de emitir cada sufragio.

## 👤 Autor
Proyecto desarrollado para la carrera de Ingeniería de Sistemas - UPEA.
© 2026 UPEA Vota.
