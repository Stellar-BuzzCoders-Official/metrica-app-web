"""Indicadores gerenciales (consultas de negocio 1 y 2 del documento)."""
from fastapi import APIRouter, Depends

from ....infrastructure.adapters.db import get_conn

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/kpis")
def kpis(conn=Depends(get_conn)):
    return conn.execute(
        """
        SELECT
          (SELECT COUNT(*) FROM consultor WHERE estado = 'ACTIVO')                         AS consultores_activos,
          (SELECT COUNT(*) FROM proyecto  WHERE estado = 'EN EJECUCION')                   AS proyectos_activos,
          (SELECT COUNT(*) FROM asignacion_proyecto WHERE estado = 'VIGENTE')              AS asignaciones_vigentes,
          (SELECT COALESCE(SUM(horas_laboradas), 0) FROM registro_horas
             WHERE estado_aprobacion = 'APROBADO'
               AND date_trunc('month', fecha_trabajo) = date_trunc('month', CURRENT_DATE)) AS horas_aprobadas_mes,
          (SELECT COUNT(*) FROM registro_horas WHERE estado_aprobacion = 'PENDIENTE')      AS registros_pendientes,
          (SELECT COALESCE(SUM(horas_laboradas), 0) FROM registro_horas
             WHERE estado_aprobacion = 'PENDIENTE')                                        AS horas_pendientes,
          (SELECT COALESCE(SUM(r.horas_laboradas * a.tarifa_hora_pactada), 0)
             FROM registro_horas r JOIN asignacion_proyecto a ON a.id_asignacion = r.id_asignacion
             WHERE r.estado_aprobacion = 'APROBADO')                                       AS prefacturacion_total,
          (SELECT COALESCE(SUM(monto_total), 0) FROM factura_servicio
             WHERE estado_pago <> 'ANULADA')                                               AS facturado_total,
          (SELECT COALESCE(SUM(monto_total), 0) FROM factura_servicio
             WHERE estado_pago = 'EMITIDA')                                                AS por_cobrar
        """
    ).fetchone()


@router.get("/ocupacion")
def ocupacion(conn=Depends(get_conn)):
    """Consulta 1: Tasa de ocupación por consultor (horas aprobadas)."""
    return conn.execute(
        """
        SELECT c.id_consultor, c.nombres, c.apellidos, rc.nombre_rol, rc.nivel_seniority,
               COALESCE(SUM(r.horas_laboradas), 0) AS total_horas
        FROM consultor c
        JOIN rol_consultor rc ON rc.id_rol = c.id_rol
        JOIN asignacion_proyecto a ON c.id_consultor = a.id_consultor
        JOIN registro_horas r ON a.id_asignacion = r.id_asignacion
        WHERE r.estado_aprobacion = 'APROBADO'
        GROUP BY c.id_consultor, rc.nombre_rol, rc.nivel_seniority
        ORDER BY total_horas DESC
        """
    ).fetchall()


@router.get("/prefacturacion")
def prefacturacion(conn=Depends(get_conn)):
    """Consulta 2: Prefacturación estimada por proyecto + consumo de presupuesto."""
    return conn.execute(
        """
        SELECT p.id_proyecto, p.nombre_proyecto, cl.razon_social, p.presupuesto_horas,
               COALESCE(SUM(r.horas_laboradas), 0)                          AS horas_aprobadas,
               COALESCE(SUM(r.horas_laboradas * a.tarifa_hora_pactada), 0)  AS total_facturable
        FROM proyecto p
        JOIN cliente cl ON cl.id_cliente = p.id_cliente
        JOIN asignacion_proyecto a ON p.id_proyecto = a.id_proyecto
        JOIN registro_horas r ON a.id_asignacion = r.id_asignacion
        WHERE r.estado_aprobacion = 'APROBADO'
        GROUP BY p.id_proyecto, cl.razon_social
        ORDER BY total_facturable DESC
        """
    ).fetchall()


@router.get("/horas-por-estado")
def horas_por_estado(conn=Depends(get_conn)):
    return conn.execute(
        """
        SELECT estado_aprobacion AS estado, COUNT(*) AS registros,
               COALESCE(SUM(horas_laboradas), 0) AS horas
        FROM registro_horas
        GROUP BY estado_aprobacion
        ORDER BY estado_aprobacion
        """
    ).fetchall()


@router.get("/tendencia")
def tendencia(semanas: int = 8, conn=Depends(get_conn)):
    """Horas registradas por semana (últimas N semanas), separadas por estado."""
    return conn.execute(
        """
        WITH semanas AS (
          SELECT generate_series(
                   date_trunc('week', CURRENT_DATE) - (%(n)s - 1) * INTERVAL '1 week',
                   date_trunc('week', CURRENT_DATE),
                   INTERVAL '1 week')::date AS semana
        )
        SELECT s.semana,
               COALESCE(SUM(r.horas_laboradas) FILTER (WHERE r.estado_aprobacion = 'APROBADO'), 0)  AS aprobadas,
               COALESCE(SUM(r.horas_laboradas) FILTER (WHERE r.estado_aprobacion = 'PENDIENTE'), 0) AS pendientes,
               COALESCE(SUM(r.horas_laboradas) FILTER (WHERE r.estado_aprobacion = 'OBSERVADO'), 0) AS observadas
        FROM semanas s
        LEFT JOIN registro_horas r ON date_trunc('week', r.fecha_trabajo)::date = s.semana
        GROUP BY s.semana
        ORDER BY s.semana
        """,
        {"n": max(1, min(semanas, 26))},
    ).fetchall()
