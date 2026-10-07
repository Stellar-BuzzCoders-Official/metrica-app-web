"""Conexión a PostgreSQL (Render) mediante un pool de psycopg 3."""
import os
from pathlib import Path

from dotenv import load_dotenv
from psycopg.rows import dict_row
from psycopg_pool import ConnectionPool

# Busca el .env en la raíz del workspace y luego en backend/
_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(_ROOT / ".env")
load_dotenv(_ROOT / "backend" / ".env")

DATABASE_URL = os.getenv("DATABASE_URL")
DB_SCHEMA = os.getenv("DB_SCHEMA", "metrica")

if not DATABASE_URL:
    raise RuntimeError("La variable de entorno DATABASE_URL no está definida.")

# autocommit=True es necesario porque los procedimientos del PDF
# (sp_aprobar_horas, sp_generar_factura_mensual) ejecutan COMMIT internamente,
# lo cual solo es válido fuera de un bloque de transacción explícito.
pool = ConnectionPool(
    conninfo=DATABASE_URL,
    min_size=1,
    max_size=5,
    open=False,
    kwargs={
        "autocommit": True,
        "row_factory": dict_row,
        "options": f"-c search_path={DB_SCHEMA},public",
    },
)


def get_conn():
    """Dependencia de FastAPI: entrega una conexión del pool."""
    with pool.connection() as conn:
        yield conn
