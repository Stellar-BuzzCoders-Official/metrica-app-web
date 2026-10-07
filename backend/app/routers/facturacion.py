"""Facturación mensual (procedimiento sp_generar_factura_mensual, IGV 18%)."""
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException

from ..db import get_conn
from ..schemas import EstadoPagoIn, GenerarFacturaIn

router = APIRouter(prefix="/api/facturas", tags=["Facturación"])

IGV = Decimal("0.18")


@router.get("")
def listar_facturas(conn=Depends(get_conn)):
    return conn.execute(
        """
        SELECT f.*, p.nombre_proyecto, cl.razon_social, cl.ruc
        FROM factura_servicio f
        JOIN proyecto p ON p.id_proyecto = f.id_proyecto
        JOIN cliente cl ON cl.id_cliente = p.id_cliente
        ORDER BY f.periodo_anio DESC, f.periodo_mes DESC, f.id_factura DESC
        """
    ).fetchall()


@router.get("/preview")
def preview(id_proyecto: int, mes: int, anio: int, conn=Depends(get_conn)):
    """Simula el cálculo del SP sin insertar: detalle por consultor de horas APROBADAS del periodo."""
    detalle = conn.execute(
        """
        SELECT c.nombres, c.apellidos, rc.nombre_rol, a.tarifa_hora_pactada,
               SUM(r.horas_laboradas)                         AS horas,
               SUM(r.horas_laboradas * a.tarifa_hora_pactada) AS subtotal
        FROM registro_horas r
        JOIN asignacion_proyecto a ON r.id_asignacion = a.id_asignacion
        JOIN consultor c ON c.id_consultor = a.id_consultor
        JOIN rol_consultor rc ON rc.id_rol = c.id_rol
        WHERE a.id_proyecto = %(p)s
          AND EXTRACT(MONTH FROM r.fecha_trabajo) = %(m)s
          AND EXTRACT(YEAR  FROM r.fecha_trabajo) = %(a)s
          AND r.estado_aprobacion = 'APROBADO'
        GROUP BY c.id_consultor, rc.nombre_rol, a.id_asignacion
        ORDER BY subtotal DESC
        """,
        {"p": id_proyecto, "m": mes, "a": anio},
    ).fetchall()
    pendientes = conn.execute(
        """
        SELECT COUNT(*) AS n, COALESCE(SUM(r.horas_laboradas), 0) AS horas
        FROM registro_horas r
        JOIN asignacion_proyecto a ON r.id_asignacion = a.id_asignacion
        WHERE a.id_proyecto = %(p)s
          AND EXTRACT(MONTH FROM r.fecha_trabajo) = %(m)s
          AND EXTRACT(YEAR  FROM r.fecha_trabajo) = %(a)s
          AND r.estado_aprobacion = 'PENDIENTE'
        """,
        {"p": id_proyecto, "m": mes, "a": anio},
    ).fetchone()
    existente = conn.execute(
        """
        SELECT numero_factura, estado_pago FROM factura_servicio
        WHERE id_proyecto = %s AND periodo_mes = %s AND periodo_anio = %s AND estado_pago <> 'ANULADA'
        LIMIT 1
        """,
        (id_proyecto, mes, anio),
    ).fetchone()

    total_horas = sum((d["horas"] for d in detalle), Decimal("0"))
    subtotal = sum((d["subtotal"] for d in detalle), Decimal("0"))
    igv = (subtotal * IGV).quantize(Decimal("0.01"))
    return {
        "detalle": detalle,
        "total_horas": total_horas,
        "subtotal": subtotal,
        "igv": igv,
        "monto_total": subtotal + igv,
        "registros_pendientes": pendientes["n"],
        "horas_pendientes": pendientes["horas"],
        "factura_existente": existente,
    }


@router.post("/generar", status_code=201)
def generar(body: GenerarFacturaIn, conn=Depends(get_conn)):
    existente = conn.execute(
        """
        SELECT numero_factura FROM factura_servicio
        WHERE id_proyecto = %s AND periodo_mes = %s AND periodo_anio = %s AND estado_pago <> 'ANULADA'
        """,
        (body.id_proyecto, body.mes, body.anio),
    ).fetchone()
    if existente:
        raise HTTPException(409, f"Ya existe la factura {existente['numero_factura']} para ese periodo")

    horas = conn.execute(
        """
        SELECT COALESCE(SUM(r.horas_laboradas), 0) AS h
        FROM registro_horas r JOIN asignacion_proyecto a ON r.id_asignacion = a.id_asignacion
        WHERE a.id_proyecto = %s AND EXTRACT(MONTH FROM r.fecha_trabajo) = %s
          AND EXTRACT(YEAR FROM r.fecha_trabajo) = %s AND r.estado_aprobacion = 'APROBADO'
        """,
        (body.id_proyecto, body.mes, body.anio),
    ).fetchone()["h"]
    if horas <= 0:
        raise HTTPException(400, "No hay horas aprobadas en el periodo seleccionado")

    conn.execute(
        "CALL sp_generar_factura_mensual(%s, %s, %s)", (body.id_proyecto, body.mes, body.anio)
    )
    return conn.execute(
        """
        SELECT f.*, p.nombre_proyecto, cl.razon_social, cl.ruc
        FROM factura_servicio f
        JOIN proyecto p ON p.id_proyecto = f.id_proyecto
        JOIN cliente cl ON cl.id_cliente = p.id_cliente
        WHERE f.id_proyecto = %s AND f.periodo_mes = %s AND f.periodo_anio = %s
        ORDER BY f.id_factura DESC LIMIT 1
        """,
        (body.id_proyecto, body.mes, body.anio),
    ).fetchone()


@router.patch("/{id_factura}/estado")
def actualizar_estado_pago(id_factura: int, body: EstadoPagoIn, conn=Depends(get_conn)):
    fila = conn.execute(
        "UPDATE factura_servicio SET estado_pago = %s WHERE id_factura = %s RETURNING *",
        (body.estado_pago, id_factura),
    ).fetchone()
    if not fila:
        raise HTTPException(404, "Factura no encontrada")
    return fila
