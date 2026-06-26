import asyncio
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time
import logging

from app.core.config import settings
from app.routers import auth, elections, students, votes, analytics, candidates, audit, usuarios
from app.services.election_service import update_expired_elections

# Configuración de Logs
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
)

# CORS
if "*" in settings.CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Middleware para Logs de tiempo de respuesta
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

# ── Tarea periódica: cerrar elecciones vencidas ─────────────────────────
async def _periodic_close_elections():
    """Ejecuta update_expired_elections cada 60 segundos."""
    while True:
        try:
            update_expired_elections()
        except Exception as e:
            logger.error(f"Error en tarea periódica de cierre de elecciones: {e}")
        await asyncio.sleep(60)

@app.on_event("startup")
async def startup():
    logger.info("Iniciando servidor — cerrando elecciones vencidas...")
    try:
        count = update_expired_elections()
        if count > 0:
            logger.info(f"Cerradas {count} elección(es) vencida(s) al iniciar")
    except Exception as e:
        logger.error(f"Error al cerrar elecciones vencidas al iniciar: {e}")
    # Iniciar tarea periódica en background
    asyncio.create_task(_periodic_close_elections())
    logger.info("Tarea periódica de cierre de elecciones iniciada (cada 60s)")

# Manejo Global de Errores
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Error no controlado: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Error interno del servidor", "error": str(exc)},
    )

# Incluir Routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Auth"])
app.include_router(elections.router, prefix=f"{settings.API_V1_STR}/elections", tags=["Elections"])
app.include_router(students.router, prefix=f"{settings.API_V1_STR}/students", tags=["Students"])
app.include_router(votes.router, prefix=f"{settings.API_V1_STR}/votes", tags=["Votes"])
app.include_router(analytics.router, prefix=f"{settings.API_V1_STR}/analytics", tags=["Analytics"])
app.include_router(candidates.router, prefix=f"{settings.API_V1_STR}/candidates", tags=["Candidates"])
app.include_router(audit.router, prefix=f"{settings.API_V1_STR}/audit", tags=["Audit"])
app.include_router(usuarios.router, prefix=f"{settings.API_V1_STR}/usuarios", tags=["Usuarios"])

@app.get("/")
async def root():
    return {
        "message": "Bienvenido a la API de UPEA Vota",
        "status": "online",
        "version": settings.VERSION
    }
