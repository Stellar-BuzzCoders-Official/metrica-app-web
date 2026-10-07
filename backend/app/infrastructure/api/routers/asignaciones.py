"""Asignación de consultores a proyectos y auditoría (trigger trg_auditoria_asignacion)."""
from fastapi import APIRouter, Depends, HTTPException

from ....infrastructure.adapters.db import get_conn
from ....domain.schemas import AsignacionIn, EstadoAsignacionIn, TarifaIn

router = APIRouter(prefix="/api", tags=["Asignaciones"])


@router.get("/asignaciones")
def listar_asignaciones(conn=Depends(get_conn)):
    return conn.execute(
        """
        SELECT a.*, c.nombres, c.apellidos, rc.nombre_rol, rc.nivel_seniority,
               rc.tarifa_referencial_hora, p.nombre_proyecto, cl.razon_social,
               COALESCE((SELECT SUM(r.horas_laboradas) FROM registro_horas r
                          WHERE r.id_asignacion = a.id_asignacion), 0) AS horas_registradas
        FROM asignacion_proyecto a
        JOIN consultor c      ON c.id_consultor = a.id_consultor
        JOIN rol_consultor rc ON rc.id_rol      = c.id_rol
        JOIN proyecto p       ON p.id_proyecto  = a.id_proyecto
        JOIN cliente cl       ON cl.id_cliente  = p.id_cliente
        ORDER BY a.estado DESC, p.nombre_proyecto, c.apellidos
        """
    ).fetchall()


@router.post("/asignaciones", status_code=201)
def crear_asignacion(body: AsignacionIn, conn=Depends(get_conn)):
    return conn.execute(
        """
        INSERT INTO asignacion_proyecto (id_proyecto, id_consultor, fecha_inicio, fecha_fin, tarifa_hora_pactada)
        VALUES (%(id_proyecto)s, %(id_consultor)s, %(fecha_inicio)s, %(fecha_fin)s, %(tarifa_hora_pactada)s)
        RETURNING *
        """,
        body.model_dump(),
    ).fetchone()


@router.patch("/asignaciones/{id_asignacion}/tarifa")
def actualizar_tarifa(id_asignacion: int, body: TarifaIn, conn=Depends(get_conn)):
    """El UPDATE dispara el trigger de auditoría definido en la BD."""
    fila = conn.execute(
        """
        UPDATE asignacion_proyecto SET tarifa_hora_pactada = %s
        WHERE id_asignacion = %s RETURNING *
        """,
        (body.tarifa_hora_pactada, id_asignacion),
    ).fetchone()
    if not fila:
        raise HTTPException(404, "Asignación no encontrada")
    return fila


@router.patch("/asignaciones/{id_asignacion}/estado")
def actualizar_estado(id_asignacion: int, body: EstadoAsignacionIn, conn=Depends(get_conn)):
    fila = conn.execute(
        "UPDATE asignacion_proyecto SET estado = %s WHERE id_asignacion = %s RETURNING *",
        (body.estado, id_asignacion),
    ).fetchone()
    if not fila:
        raise HTTPException(404, "Asignación no encontrada")
    return fila


@router.get("/auditoria")
def auditoria(conn=Depends(get_conn)):
    """Consulta 3: Auditoría de variación de tarifas recientes."""
    return conn.execute(
        """
        SELECT au.id_auditoria, au.accion, au.usuario_bd, au.fecha_evento, au.detalle,
               au.id_asignacion, c.nombres, c.apellidos, p.nombre_proyecto
        FROM auditoria_asignacion au
        JOIN asignacion_proyecto a ON a.id_asignacion = au.id_asignacion
        JOIN consultor c ON c.id_consultor = a.id_consultor
        JOIN proyecto p  ON p.id_proyecto  = a.id_proyecto
        ORDER BY au.fecha_evento DESC
        LIMIT 50
        """
    ).fetchall()
