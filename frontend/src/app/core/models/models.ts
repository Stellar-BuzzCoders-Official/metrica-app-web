/** Modelos que reflejan las entidades del esquema `metrica` y las respuestas de la API. */

export type RolUsuario = 'CONSULTOR' | 'PM' | 'FINANZAS' | 'ADMIN';
export type EstadoAprobacion = 'PENDIENTE' | 'APROBADO' | 'OBSERVADO';
export type EstadoPago = 'EMITIDA' | 'PAGADA' | 'ANULADA';
export type EstadoAsignacion = 'VIGENTE' | 'SUSPENDIDA' | 'FINALIZADA';

export interface RolConsultor {
  id_rol: number;
  nombre_rol: string;
  nivel_seniority: 'Junior' | 'Semi-Senior' | 'Senior' | 'Lead';
  tarifa_referencial_hora: number;
}

export interface Consultor {
  id_consultor: number;
  dni: string;
  nombres: string;
  apellidos: string;
  email_corporativo: string;
  telefono: string | null;
  fecha_ingreso: string;
  estado: string;
  id_rol: number;
  nombre_rol: string;
  nivel_seniority: string;
  tarifa_referencial_hora: number;
  asignaciones_vigentes: number;
}

export interface Cliente {
  id_cliente: number;
  ruc: string;
  razon_social: string;
  sector: string;
  contacto_nombre: string;
  email_contacto: string;
  telefono_contacto: string | null;
  total_proyectos: number;
}

export interface Proyecto {
  id_proyecto: number;
  id_cliente: number;
  nombre_proyecto: string;
  tipo_servicio: string;
  fecha_inicio: string;
  fecha_fin_estimada: string | null;
  presupuesto_horas: number;
  estado: string;
  razon_social: string;
  horas_consumidas: number;
  consultores_asignados: number;
}

export interface Tarea {
  id_tarea: number;
  id_proyecto?: number;
  nombre_tarea: string;
  horas_estimadas: number;
  estado: string;
  horas_registradas?: number;
}

export interface Asignacion {
  id_asignacion: number;
  id_proyecto: number;
  id_consultor: number;
  fecha_inicio: string;
  fecha_fin: string | null;
  tarifa_hora_pactada: number;
  estado: EstadoAsignacion;
  nombres: string;
  apellidos: string;
  nombre_rol: string;
  nivel_seniority: string;
  tarifa_referencial_hora: number;
  nombre_proyecto: string;
  razon_social: string;
  horas_registradas: number;
}

export interface AsignacionConsultor {
  id_asignacion: number;
  id_proyecto: number;
  tarifa_hora_pactada: number;
  fecha_inicio: string;
  fecha_fin: string | null;
  nombre_proyecto: string;
  razon_social: string;
  tareas: Tarea[];
}

export interface RegistroHoras {
  id_registro: number;
  id_asignacion: number;
  id_tarea: number;
  fecha_trabajo: string;
  horas_laboradas: number;
  descripcion_actividad: string;
  estado_aprobacion: EstadoAprobacion;
  fecha_creacion: string;
  nombre_tarea: string;
  id_consultor: number;
  id_proyecto: number;
  tarifa_hora_pactada: number;
  monto: number;
  nombres: string;
  apellidos: string;
  nombre_proyecto: string;
  razon_social: string;
}

export interface Auditoria {
  id_auditoria: number;
  accion: string;
  usuario_bd: string;
  fecha_evento: string;
  detalle: string;
  id_asignacion: number;
  nombres: string;
  apellidos: string;
  nombre_proyecto: string;
}

export interface Factura {
  id_factura: number;
  id_proyecto: number;
  numero_factura: string;
  periodo_mes: number;
  periodo_anio: number;
  total_horas: number;
  subtotal: number;
  igv: number;
  monto_total: number;
  fecha_emision: string;
  estado_pago: EstadoPago;
  nombre_proyecto: string;
  razon_social: string;
  ruc: string;
}

export interface FacturaPreview {
  detalle: {
    nombres: string;
    apellidos: string;
    nombre_rol: string;
    tarifa_hora_pactada: number;
    horas: number;
    subtotal: number;
  }[];
  total_horas: number;
  subtotal: number;
  igv: number;
  monto_total: number;
  registros_pendientes: number;
  horas_pendientes: number;
  factura_existente: { numero_factura: string; estado_pago: string } | null;
}

export interface Kpis {
  consultores_activos: number;
  proyectos_activos: number;
  asignaciones_vigentes: number;
  horas_aprobadas_mes: number;
  registros_pendientes: number;
  horas_pendientes: number;
  prefacturacion_total: number;
  facturado_total: number;
  por_cobrar: number;
}

export interface Ocupacion {
  id_consultor: number;
  nombres: string;
  apellidos: string;
  nombre_rol: string;
  nivel_seniority: string;
  total_horas: number;
}

export interface Prefacturacion {
  id_proyecto: number;
  nombre_proyecto: string;
  razon_social: string;
  presupuesto_horas: number;
  horas_aprobadas: number;
  total_facturable: number;
}

export interface HorasEstado {
  estado: EstadoAprobacion;
  registros: number;
  horas: number;
}

export interface TendenciaSemana {
  semana: string;
  aprobadas: number;
  pendientes: number;
  observadas: number;
}

export interface Health {
  status: string;
  schema: string;
  version: string;
  usuario: string;
  hora: string;
}
