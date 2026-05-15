# 🛠️ Guía de Despliegue y Mantenimiento - UPEA Vota

Este documento detalla los pasos finales para llevar el sistema a producción y asegurar su correcto funcionamiento.

## 🏁 Checklist de Producción

### 1. Supabase (Base de Datos)
- [ ] Ejecutar `supabase_schema.sql` (Verificar que los índices existan).
- [ ] Configurar Buckets `photos-estudiantes` y `photos-candidatos` como **Públicos**.
- [ ] Establecer políticas RLS (Row Level Security) - *Ya incluidas en el SQL*.
- [ ] Generar un usuario administrador manualmente en la tabla `profiles` tras el primer registro si es necesario.

### 2. Backend (Render)
- [ ] Crear un nuevo **Web Service**.
- [ ] Configurar variables de entorno (.env):
  - `SUPABASE_URL`
  - `SUPABASE_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `JWT_SECRET` (Generar uno nuevo con `openssl rand -hex 32`)
  - `CORS_ORIGINS`: `["https://tu-sitio.netlify.app"]`
  - `FACE_MATCH_THRESHOLD`: `0.55` (Ajustar según necesidad)
- [ ] Verificar que el comando de inicio sea: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### 3. Frontend (Netlify/Vercel)
- [ ] Configurar variable `VITE_API_URL` apuntando a la URL de Render (con `/api/v1`).
- [ ] Asegurar que el build command sea `npm run build` y el directorio `dist`.
- [ ] Configurar redirecciones para SPA (archivo `public/_redirects` con content `/* /index.html 200`).

## 🧪 Plan de Pruebas (Testing)

| Caso de Prueba | Acción Esperada |
| :--- | :--- |
| **Login Estudiante** | RU y CI válidos deben redirigir al Dashboard del Estudiante. |
| **Registro** | Debe capturar rostro, subir foto a Supabase y crear perfil. |
| **Votación Única** | Intentar votar dos veces en la misma categoría debe fallar (Error 400). |
| **Biometría** | Intentar votar con un rostro diferente debe ser rechazado (Error 401). |
| **Sesión Expirada** | Tras la expiración del JWT, el frontend debe redirigir al Login automáticamente. |
| **Filtros Admin** | La búsqueda de estudiantes por CI/RU debe ser instantánea. |
| **Exportación** | El botón de exportar resultados debe generar un archivo `.csv` válido. |

## 🛡️ Hardening Realizado
1. **Validación de Payload**: El backend limita el tamaño de imágenes a 5MB para prevenir ataques de denegación de servicio (DoS) por memoria.
2. **Atomicidad**: Los votos se registran en una sola transacción SQL tras la validación biométrica.
3. **Optimización de Memoria**: Redimensión de imágenes en el servidor para evitar que el proceso de IA sature los 512MB de Render.
4. **Seguridad JWT**: Verificación estricta de firma y tiempo de expiración.
5. **CORS Restringido**: Capacidad de limitar el acceso a la API solo desde el dominio del frontend.

## 🆘 Troubleshooting Común
- **Cámara no abre**: Verificar que el sitio use HTTPS (Requerido por los navegadores modernos para acceder a la webcam).
- **Error 401 en Voto**: Asegurarse de tener buena iluminación. Si persiste, ajustar `FACE_MATCH_THRESHOLD` a un valor mayor (ej: 0.6).
- **Backend Lento**: El primer voto puede tardar ~2-3 segundos mientras se cargan los modelos de IA (Lazy Loading). Los siguientes serán rápidos.
