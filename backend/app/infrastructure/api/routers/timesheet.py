"""Registro de horas (timesheets) y flujo de aprobación."""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException

from ....infrastructure.adapters.db import get_conn
from ....domain.schemas import LoteIdsIn, RegistroHorasIn, RegistroUIIn
from ....application.use_cases.timesheet_service import TimesheetUseCase
from ....infrastructure.adapters.timesheet_repo import PostgresTimesheetRepository

router = APIRouter(prefix="/api/registros", tags=["Timesheets"])

_SELECT_REGISTROS = """
    SELECT r.*, t.nombre_tarea, a.id_consultor, a.id_proyecto, a.tarifa_hora_pactada,
           (r.horas_laboradas * a.tarifa_hora_pactada) AS monto,
           c.nombres, c.apellidos, p.nombre_proyecto, cl.razon_social
    FROM registro_horas r
    JOIN asignacion_proyecto a ON a.id_asignacion = r.id_asignacion
    JOIN consultor c           ON c.id_consultor  = a.id_consultor
    JOIN proyecto p            ON p.id_proyecto   = a.id_proyecto
    JOIN cliente cl            ON cl.id_cliente   = p.id_cliente
    JOIN tarea_entregable t    ON t.id_tarea      = r.id_tarea
"""


@router.get("")
def listar_registros(
    id_consultor: Optional[int] = None,
    id_proyecto: Optional[int] = None,
    estado: Optional[str] = None,
    limite: int = 200,
    conn=Depends(get_conn),
):
    filtros, params = [], {}
    if id_consultor:
        filtros.append("a.id_consultor = %(id_consultor)s")
        params["id_consultor"] = id_consultor
    if id_proyecto:
        filtros.append("a.id_proyecto = %(id_proyecto)s")
        params["id_proyecto"] = id_proyecto
    if estado:
        filtros.append("r.estado_aprobacion = %(estado)s")
        params["estado"] = estado.upper()
    where = f"WHERE {' AND '.join(filtros)}" if filtros else ""
    params["limite"] = max(1, min(limite, 1000))
    return conn.execute(
        f"{_SELECT_REGISTROS} {where} ORDER BY r.fecha_trabajo DESC, r.id_registro DESC LIMIT %(limite)s",
        params,
    ).fetchall()


@router.post("/ui", status_code=201)
def registrar_horas_ui(body: RegistroUIIn, conn=Depends(get_conn)):
    repo = PostgresTimesheetRepository(conn)
    use_case = TimesheetUseCase(repo)
    try:
        registro = use_case.registrar_horas(body)
        return registro
    except ValueError as e:
        raise HTTPException(400, str(e))


@router.post("", status_code=201)
def registrar_horas(body: RegistroHorasIn, conn=Depends(get_conn)):
    """Transacción de negocio D: inserta el registro y marca la tarea EN PROGRESO (atómico)."""
    with conn.transaction():
        asig = conn.execute(
            "SELECT id_proyecto, estado FROM asignacion_proyecto WHERE id_asignacion = %s FOR SHARE",
            (body.id_asignacion,),
        ).fetchone()
        if not asig:
            raise HTTPException(404, "Asignación no encontrada")
        if asig["estado"] != "VIGENTE":
            raise HTTPException(409, "La asignación no está vigente")
        tarea = conn.execute(
            "SELECT id_proyecto FROM tarea_entregable WHERE id_tarea = %s", (body.id_tarea,)
        ).fetchone()
        if not tarea or tarea["id_proyecto"] != asig["id_proyecto"]:
            raise HTTPException(400, "La tarea no pertenece al proyecto de la asignación")

        registro = conn.execute(
            """
            INSERT INTO registro_horas (fecha_trabajo, horas_laboradas, descripcion_actividad,
                                        id_asignacion, id_tarea)
            VALUES (%(fecha_trabajo)s, %(horas_laboradas)s, %(descripcion_actividad)s,
                    %(id_asignacion)s, %(id_tarea)s)
            RETURNING *
            """,
            body.model_dump(),
        ).fetchone()
        conn.execute(
            "UPDATE tarea_entregable SET estado = 'EN PROGRESO' WHERE id_tarea = %s AND estado = 'PENDIENTE'",
            (body.id_tarea,),
        )
    return registro


def _verificar_pendiente(conn, id_registro: int):
    reg = conn.execute(
        "SELECT estado_aprobacion FROM registro_horas WHERE id_registro = %s", (id_registro,)
    ).fetchone()
    if not reg:
        raise HTTPException(404, "Registro no encontrado")
    return reg


@router.put("/{id_registro}/aprobar")
def aprobar(id_registro: int, conn=Depends(get_conn)):
    """Invoca el procedimiento almacenado sp_aprobar_horas."""
    _verificar_pendiente(conn, id_registro)
    conn.execute("CALL sp_aprobar_horas(%s)", (id_registro,))
    return {"id_registro": id_registro, "estado_aprobacion": "APROBADO"}


@router.post("/aprobar-lote")
def aprobar_lote(body: LoteIdsIn, conn=Depends(get_conn)):
    for id_registro in body.ids:
        conn.execute("CALL sp_aprobar_horas(%s)", (id_registro,))
    return {"aprobados": len(body.ids)}


@router.put("/{id_registro}/observar")
def observar(id_registro: int, conn=Depends(get_conn)):
    _verificar_pendiente(conn, id_registro)
    conn.execute(
        "UPDATE registro_horas SET estado_aprobacion = 'OBSERVADO' WHERE id_registro = %s",
        (id_registro,),
    )
    return {"id_registro": id_registro, "estado_aprobacion": "OBSERVADO"}
