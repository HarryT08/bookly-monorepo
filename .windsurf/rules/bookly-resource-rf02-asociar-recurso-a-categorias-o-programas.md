---
trigger: manual
---

## RF-02: Asociar cada recurso a una categoría y un programa académico

El sistema debe permitir la asociación de cada recurso (salones, auditorios, laboratorios, equipos, herramientas, etc.) a una categoría específica y a uno o más programas académicos dentro de la universidad. Esta asociación garantizará una mejor organización, filtrado y acceso a los recursos según las necesidades académicas y administrativas.

### Criterios de Aceptación

- Los recursos deben clasificarse en **categorías predefinidas y configurables** (Ejemplo: Salón de clases, Laboratorio de cómputo, Auditorio, Equipo multimedia, Herramienta de investigación, etc.).
- Cada recurso debe estar **asociado a uno o más programas académicos** para gestionar su acceso y uso.
- Se debe permitir la **asignación múltiple**, es decir, un recurso puede pertenecer a varias categorías si aplica (Ejemplo: un auditorio puede estar categorizado como "Espacio Multiuso" y "Sala de Conferencias").
- Los administradores deben poder **editar y actualizar la categoría y el programa académico** de un recurso en cualquier momento.
- Se debe habilitar un **filtro dinámico** para facilitar la búsqueda y gestión de recursos por categoría o programa académico.

### Flujo de Uso

#### Asignación de Categoría y Programa al Crear un Recurso

- El administrador accede a la opción **"Crear Nuevo Recurso"**.
- Selecciona una o más **categorías del recurso** (menú desplegable o etiquetado dinámico).
- Asigna el recurso a uno o más **programas académicos**.
- Guarda la información y el sistema **valida la configuración antes de confirmar**.

#### Edición de Categoría o Programa Académico

- El administrador accede al módulo de gestión de recursos.
- Busca el recurso a modificar mediante filtros avanzados.
- Selecciona **"Editar"** y actualiza la categoría y/o el programa académico.
- Guarda los cambios y el sistema registra la actualización en el historial de auditoría.

#### Visualización y Filtrado de Recursos por Categoría y Programa

- Los usuarios pueden **filtrar y buscar recursos según su categoría o programa académico**.
- En vista de disponibilidad, los recursos deben **mostrar su clasificación claramente**.

### Restricciones y Consideraciones

- Un recurso **no puede crearse sin estar asociado al menos a una categoría y un programa académico**.
- La reasignación de un recurso a otra categoría o programa académico debe **generar una notificación a los usuarios afectados**.
- Solo los administradores pueden **modificar la categoría y el programa académico** de un recurso.

### Requerimientos No Funcionales Relacionados

- **Eficiencia:** La asignación y actualización de categorías y programas académicos debe realizarse en **menos de 2 segundos**.
- **Seguridad:** La modificación de la categoría y el programa académico debe estar **restringida a administradores autorizados**.
- **Auditoría:** Se debe registrar cualquier **cambio de categoría o programa académico** en un historial de modificaciones con usuario, fecha y hora.
