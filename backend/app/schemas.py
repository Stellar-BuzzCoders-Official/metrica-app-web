"""Modelos Pydantic de entrada (validan antes de llegar a los CHECK de PostgreSQL)."""
from datetime import date
from decimal import Decimal
from typing import Literal, Optional

from pydantic import BaseModel, Field, field_validator

Seniority = Literal["Junior", "Semi-Senior", "Senior", "Lead"]


class ConsultorIn(BaseModel):
    dni: str = Field(pattern=r"^\d{8}$")
    nombres: str = Field(min_length=1, max_length=100)
    apellidos: str = Field(min_length=1, max_length=100)
    email_corporativo: str = Field(min_length=5, max_length=120)
    telefono: Optional[str] = Field(default=None, max_length=15)
    fecha_ingreso: Optional[date] = None
    id_rol: int


class ClienteIn(BaseModel):
    ruc: str = Field(pattern=r"^\d{11}$")
    razon_social: str = Field(min_length=1, max_length=150)
    sector: str = Field(min_length=1, max_length=50)
    contacto_nombre: str = Field(min_length=1, max_length=100)
    email_contacto: str = Field(min_length=5, max_length=120)
    telefono_contacto: Optional[str] = Field(default=None, max_length=15)


class ProyectoIn(BaseModel):
    id_cliente: int
    nombre_proyecto: str = Field(min_length=1, max_length=150)
    tipo_servicio: str = Field(min_length=1, max_length=50)
    fecha_inicio: date
    fecha_fin_estimada: Optional[date] = None
    presupuesto_horas: int = Field(gt=0)


class TareaIn(BaseModel):
    id_proyecto: int
    nombre_tarea: str = Field(min_length=1, max_length=150)
    horas_estimadas: Decimal = Field(default=Decimal("0"), ge=0)


class AsignacionIn(BaseModel):
    id_proyecto: int
    id_consultor: int
    fecha_inicio: date
    fecha_fin: Optional[date] = None
    tarifa_hora_pactada: Decimal = Field(gt=0)


class TarifaIn(BaseModel):
    tarifa_hora_pactada: Decimal = Field(gt=0)


class EstadoAsignacionIn(BaseModel):
    estado: Literal["VIGENTE", "SUSPENDIDA", "FINALIZADA"]


class RegistroHorasIn(BaseModel):
    id_asignacion: int
    id_tarea: int
    fecha_trabajo: date
    horas_laboradas: Decimal = Field(ge=Decimal("0.5"), le=Decimal("16"))
    descripcion_actividad: str = Field(min_length=3)

    @field_validator("fecha_trabajo")
    @classmethod
    def no_futuro(cls, v: date) -> date:
        if v > date.today():
            raise ValueError("La fecha de trabajo no puede ser futura")
        return v


class LoteIdsIn(BaseModel):
    ids: list[int] = Field(min_length=1)


class GenerarFacturaIn(BaseModel):
    id_proyecto: int
    mes: int = Field(ge=1, le=12)
    anio: int = Field(ge=2020)


class EstadoPagoIn(BaseModel):
    estado_pago: Literal["EMITIDA", "PAGADA", "ANULADA"]
