from typing import Protocol
from ...domain.schemas import RegistroUIIn

class TimesheetRepository(Protocol):
    def check_asignacion_vigente(self, consultor_id: int, proyecto_id: int) -> int | None:
        ...
    def get_first_tarea_id(self, proyecto_id: int) -> int | None:
        ...
    def create_tarea_general(self, proyecto_id: int) -> int:
        ...
    def insert_registro(self, data: dict) -> dict:
        ...

class TimesheetUseCase:
    def __init__(self, repo: TimesheetRepository):
        self.repo = repo

    def registrar_horas(self, body: RegistroUIIn) -> dict:
        id_asignacion = self.repo.check_asignacion_vigente(body.consultor_id, body.proyecto_id)
        if not id_asignacion:
            raise ValueError("El consultor no tiene asignacion vigente en este proyecto")
        
        tarea_id = self.repo.get_first_tarea_id(body.proyecto_id)
        if not tarea_id:
            tarea_id = self.repo.create_tarea_general(body.proyecto_id)
            
        return self.repo.insert_registro({
            "fecha_trabajo": body.fecha_registro,
            "horas_laboradas": body.horas_trabajadas,
            "descripcion_actividad": body.descripcion_actividad,
            "id_asignacion": id_asignacion,
            "id_tarea": tarea_id
        })
