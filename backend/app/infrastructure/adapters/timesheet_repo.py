from psycopg import Connection
from ....application.use_cases.timesheet_service import TimesheetRepository

class PostgresTimesheetRepository(TimesheetRepository):
    def __init__(self, conn: Connection):
        self.conn = conn

    def check_asignacion_vigente(self, consultor_id: int, proyecto_id: int) -> int | None:
        row = self.conn.execute(
            "SELECT id_asignacion FROM asignacion_proyecto WHERE id_consultor = %s AND id_proyecto = %s AND estado = 'VIGENTE'",
            (consultor_id, proyecto_id)
        ).fetchone()
        return row["id_asignacion"] if row else None

    def get_first_tarea_id(self, proyecto_id: int) -> int | None:
        row = self.conn.execute(
            "SELECT id_tarea FROM tarea_entregable WHERE id_proyecto = %s LIMIT 1",
            (proyecto_id,)
        ).fetchone()
        return row["id_tarea"] if row else None

    def create_tarea_general(self, proyecto_id: int) -> int:
        return self.conn.execute(
            "INSERT INTO tarea_entregable (id_proyecto, nombre_tarea, horas_estimadas, estado) VALUES (%s, 'Tarea General', 10, 'PENDIENTE') RETURNING id_tarea",
            (proyecto_id,)
        ).fetchone()["id_tarea"]

    def insert_registro(self, data: dict) -> dict:
        return self.conn.execute(
            """
            INSERT INTO registro_horas (fecha_trabajo, horas_laboradas, descripcion_actividad, id_asignacion, id_tarea)
            VALUES (%(fecha_trabajo)s, %(horas_laboradas)s, %(descripcion_actividad)s, %(id_asignacion)s, %(id_tarea)s)
            RETURNING *
            """,
            data
        ).fetchone()
