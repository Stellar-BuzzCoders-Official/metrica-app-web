"""API FastAPI - Sistema de Gestión de Consultores, Timesheets y Facturación (Métrica Andina S.A.C.)."""
import os
from contextlib import asynccontextmanager

import psycopg
from fastapi import Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from ..adapters.db import DB_SCHEMA, get_conn, pool
from .routers import asignaciones, catalogos, dashboard, facturacion, timesheet


@asynccontextmanager
async def lifespan(_: FastAPI):
    pool.open()
    yield
    pool.close()


app = FastAPI(
    title="Métrica Andina API",
    description="Gestión de asignación de consultores, timesheets y facturación de servicios TI.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:4200").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Traducción de errores de PostgreSQL a respuestas HTTP legibles ----------
def _pg_message(exc: psycopg.Error) -> str:
    diag = getattr(exc, "diag", None)
    return (diag.message_primary if diag and diag.message_primary else str(exc)).strip()


@app.exception_handler(psycopg.errors.UniqueViolation)
async def _unique(_: Request, exc: psycopg.Error):
    return JSONResponse(status_code=409, content={"detail": f"Registro duplicado: {_pg_message(exc)}"})


@app.exception_handler(psycopg.errors.CheckViolation)
async def _check(_: Request, exc: psycopg.Error):
    return JSONResponse(status_code=422, content={"detail": f"Restricción CHECK violada: {_pg_message(exc)}"})


@app.exception_handler(psycopg.errors.ForeignKeyViolation)
async def _fk(_: Request, exc: psycopg.Error):
    return JSONResponse(status_code=400, content={"detail": f"Referencia inválida: {_pg_message(exc)}"})


@app.exception_handler(psycopg.Error)
async def _pg(_: Request, exc: psycopg.Error):
    return JSONResponse(status_code=500, content={"detail": f"Error de base de datos: {_pg_message(exc)}"})


@app.get("/", tags=["Sistema"])
def root():
    return {"message": "Métrica Andina API - Server is running!", "status": "ok"}


@app.get("/api/health", tags=["Sistema"])
def health(conn=Depends(get_conn)):
    row = conn.execute("SELECT version() AS version, current_user AS usuario, now() AS hora").fetchone()
    return {"status": "ok", "schema": DB_SCHEMA, **row}


app.include_router(dashboard.router)
app.include_router(catalogos.router)
app.include_router(timesheet.router)
app.include_router(asignaciones.router)
app.include_router(facturacion.router)
