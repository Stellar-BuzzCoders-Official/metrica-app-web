# Sistema de Gestión de Consultores - Métrica Andina S.A.C.

## 🚀 Entornos Desplegados (Render)
- **Frontend (Aplicación Web):** [https://metrica-frontend.onrender.com](https://metrica-frontend.onrender.com)
- **Backend (API REST):** [https://metrica-backend-n1r3.onrender.com](https://metrica-backend-n1r3.onrender.com)

---

## 🏢 Contexto del Negocio
Métrica Andina es una empresa consultora especializada en Servicios de TI. Este sistema nace de la necesidad de centralizar, automatizar y controlar el flujo operativo y financiero de la empresa, abarcando las siguientes áreas clave:

1. **Gestión de Asignaciones:** Administración de consultores, sus roles, seniority (Junior, Senior, etc.) y las tarifas por hora pactadas específicamente para cada proyecto.
2. **Registro de Horas (Timesheets):** Los consultores registran diariamente las horas laboradas en las tareas y proyectos a los que están asignados.
3. **Flujo de Aprobaciones:** Un panel para que los Project Managers aprueben u observen las horas ingresadas, garantizando que solo las horas válidas pasen a facturación.
4. **Facturación Mensual Automatizada:** Motor que pre-calcula los subtotales, IGV (18%) y monto total a facturar a un cliente en base a la sumatoria exclusiva de las horas que ya fueron **aprobadas** en dicho mes.
5. **Indicadores de Rendimiento (KPIs):** Dashboard gerencial en tiempo real para visualizar:
   - Consumo de presupuesto de los proyectos (Rentabilidad).
   - Nivel de ocupación / sobre-asignación de la nómina de consultores.
   - Estado global de registros de horas.

---

## 🛠 Stack Tecnológico

El proyecto está diseñado para ser altamente responsivo, escalable y mantenible.

### Frontend
- **Framework:** Angular 18+ (Implementación moderna: *Standalone Components*, Control Flow `@if/@for`, Signals).
- **Estilos:** Vanilla CSS puro (Uso de CSS Variables, Flexbox, CSS Grid y diseño Glassmorphism avanzado para una interfaz premium).
- **Despliegue:** Render (Static Site) con proxy rewrite hacia el backend.

### Backend
- **Framework:** FastAPI (Python 3.10+) para endpoints asíncronos y extremadamente rápidos.
- **Validación:** Pydantic (Tipado estricto de los payloads y respuestas).
- **Base de Datos:** PostgreSQL 16+.
- **Driver DB:** `psycopg` v3 (Para consultas directas y ejecución veloz de Procedimientos Almacenados).
- **Diseño de Software:** Arquitectura Hexagonal (Puertos y Adaptadores) separando estrictamente el Dominio, los Casos de Uso (Aplicación) y la Infraestructura (Routers / DB).
- **Despliegue:** Render (Web Service Free Tier).
