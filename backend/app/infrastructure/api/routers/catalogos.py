"""Catálogos maestros: roles, consultores, clientes, proyectos y tareas."""
from fastapi import APIRouter, Depends, HTTPException

from ....infrastructure.adapters.db import get_conn
from ....domain.schemas import ClienteIn, ConsultorIn, ProyectoIn, TareaIn

router = APIRouter(prefix="/api", tags=["Catálogos"])


@router.get("/roles")
def listar_roles(conn=Depends(get_conn)):
    return conn.execute(
        "SELECT * FROM rol_consultor ORDER BY tarifa_referencial_hora"
    ).fetchall()


# ---------------------------------------------------------------- Consultores
@router.get("/consultores")
def listar_consultores(conn=Depends(get_conn)):
    return conn.execute(
        """
        SELECT c.*, rc.nombre_rol, rc.nivel_seniority, rc.tarifa_referencial_hora,
               (SELECT COUNT(*) FROM asignacion_proyecto a
                 WHERE a.id_consultor = c.id_consultor AND a.estado = 'VIGENTE') AS asignaciones_vigentes
        FROM consultor c
        JOIN rol_consultor rc ON rc.id_rol = c.id_rol
        ORDER BY c.apellidos, c.nombres
        """
    ).fetchall()


@router.post("/consultores", status_code=201)
def crear_consultor(body: ConsultorIn, conn=Depends(get_conn)):
    return conn.execute(
        """
        INSERT INTO consultor (dni, nombres, apellidos, email_corporativo, telefono, fecha_ingreso, id_rol)
        VALUES (%(dni)s, %(nombres)s, %(apellidos)s, %(email_corporativo)s, %(telefono)s,
                COALESCE(%(fecha_ingreso)s, CURRENT_DATE), %(id_rol)s)
        RETURNING *
        """,
        body.model_dump(),
    ).fetchone()


@router.get("/consultores/{id_consultor}/asignaciones")
def asignaciones_de_consultor(id_consultor: int, conn=Depends(get_conn)):
    """Asignaciones vigentes de un consultor con las tareas de cada proyecto."""
    asignaciones = conn.execute(
        """
        SELECT a.id_asignacion, a.id_proyecto, a.tarifa_hora_pactada, a.fecha_inicio, a.fecha_fin,
               p.nombre_proyecto, cl.razon_social
        FROM asignacion_proyecto a
        JOIN proyecto p ON p.id_proyecto = a.id_proyecto
        JOIN cliente cl ON cl.id_cliente = p.id_cliente
        WHERE a.id_consultor = %s AND a.estado = 'VIGENTE'
        ORDER BY p.nombre_proyecto
        """,
        (id_consultor,),
    ).fetchall()
    for a in asignaciones:
        a["tareas"] = conn.execute(
            """
            SELECT id_tarea, nombre_tarea, horas_estimadas, estado
            FROM tarea_entregable WHERE id_proyecto = %s ORDER BY id_tarea
            """,
            (a["id_proyecto"],),
        ).fetchall()
    return asignaciones


# ------------------------------------------------------------------- Clientes
@router.get("/clientes")
def listar_clientes(conn=Depends(get_conn)):
    return conn.execute(
        """
        SELECT cl.*,
               (SELECT COUNT(*) FROM proyecto p WHERE p.id_cliente = cl.id_cliente) AS total_proyectos
        FROM cliente cl ORDER BY cl.razon_social
        """
    ).fetchall()


@router.post("/clientes", status_code=201)
def crear_cliente(body: ClienteIn, conn=Depends(get_conn)):
    return conn.execute(
        """
        INSERT INTO cliente (ruc, razon_social, sector, contacto_nombre, email_contacto, telefono_contacto)
        VALUES (%(ruc)s, %(razon_social)s, %(sector)s, %(contacto_nombre)s, %(email_contacto)s, %(telefono_contacto)s)
        RETURNING *
        """,
        body.model_dump(),
    ).fetchone()


# ------------------------------------------------------------------ Proyectos
@router.get("/proyectos")
def listar_proyectos(conn=Depends(get_conn)):
    return conn.execute(
        """
        SELECT p.*, cl.razon_social,
               COALESCE((SELECT SUM(r.horas_laboradas)
                           FROM registro_horas r
                           JOIN asignacion_proyecto a ON a.id_asignacion = r.id_asignacion
                          WHERE a.id_proyecto = p.id_proyecto
                            AND r.estado_aprobacion = 'APROBADO'), 0) AS horas_consumidas,
               (SELECT COUNT(*) FROM asignacion_proyecto a
                 WHERE a.id_proyecto = p.id_proyecto AND a.estado = 'VIGENTE') AS consultores_asignados
        FROM proyecto p
        JOIN cliente cl ON cl.id_cliente = p.id_cliente
        ORDER BY p.fecha_inicio DESC
        """
    ).fetchall()


@router.post("/proyectos", status_code=201)
def crear_proyecto(body: ProyectoIn, conn=Depends(get_conn)):
    return conn.execute(
        """
        INSERT INTO proyecto (id_cliente, nombre_proyecto, tipo_servicio, fecha_inicio,
                              fecha_fin_estimada, presupuesto_horas)
        VALUES (%(id_cliente)s, %(nombre_proyecto)s, %(tipo_servicio)s, %(fecha_inicio)s,
                %(fecha_fin_estimada)s, %(presupuesto_horas)s)
        RETURNING *
        """,
        body.model_dump(),
    ).fetchone()


@router.get("/proyectos/{id_proyecto}/tareas")
def tareas_de_proyecto(id_proyecto: int, conn=Depends(get_conn)):
    return conn.execute(
        """
        SELECT t.*,
               COALESCE((SELECT SUM(r.horas_laboradas) FROM registro_horas r
                          WHERE r.id_tarea = t.id_tarea), 0) AS horas_registradas
        FROM tarea_entregable t WHERE t.id_proyecto = %s ORDER BY t.id_tarea
        """,
        (id_proyecto,),
    ).fetchall()


@router.post("/tareas", status_code=201)
def crear_tarea(body: TareaIn, conn=Depends(get_conn)):
    existe = conn.execute(
        "SELECT 1 FROM proyecto WHERE id_proyecto = %s", (body.id_proyecto,)
    ).fetchone()
    if not existe:
        raise HTTPException(404, "Proyecto no encontrado")
    return conn.execute(
        """
        INSERT INTO tarea_entregable (id_proyecto, nombre_tarea, horas_estimadas)
        VALUES (%(id_proyecto)s, %(nombre_tarea)s, %(horas_estimadas)s)
        RETURNING *
        """,
        body.model_dump(),
    ).fetchone()
