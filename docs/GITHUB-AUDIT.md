# Auditoría de entornos/repos GitHub

Este proyecto incluye un script para auditar repositorios de una cuenta u organización de GitHub desde terminal.

## Requisitos

- `curl`
- `jq`
- `GITHUB_TOKEN` configurado en el entorno

> Token recomendado: acceso de solo lectura a metadata de repos y Actions.

## Uso

### Auditar owners específicos (usuario u organización)

```bash
export GITHUB_TOKEN="<tu_token>"
scripts/github-audit.sh --owner tu-usuario --owner tu-org
```

### Auditar todos los repos accesibles del usuario autenticado (incluyendo privados con acceso)

```bash
scripts/github-audit.sh --self
```

### Cambiar carpeta de salida

```bash
scripts/github-audit.sh --owner tu-org --output-dir ./mi-auditoria
```

## Salidas

Por cada owner se genera:

- `repos.json`: inventario completo de repos (respuesta API agregada)
- `summary.md`: resumen ejecutivo
- `archived.txt`: repos archivados
- `stale-180d.txt`: repos sin push en 180+ días
- `no-ci-workflow.txt`: repos sin workflows de GitHub Actions
- `workflow-check-unknown.txt`: repos donde no se pudo verificar workflows (permisos/estado)

## Qué revisa

- Volumen total de repos
- Distribución (privados, forks, archivados)
- Salud de actividad (stale por fecha de push)
- Cobertura mínima de CI (presencia de workflows de Actions)
- Casos de verificación incompleta de Actions para seguimiento
