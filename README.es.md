# bkit-doctor

> ⚠️ **En desarrollo** — Este proyecto está en desarrollo activo.

> Una herramienta de línea de comandos para diagnosticar, inicializar y mantener entornos de proyectos al estilo bkit.

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![Version](https://img.shields.io/badge/version-0.5.8-orange.svg)](CHANGELOG.md)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/wpfhak/bkit-doctor/pulls)

[English](README.md) | [한국어](README.ko.md) | [日本語](README.ja.md) | [中文](README.zh.md) | **Español**

---

## Introducción

**bkit-doctor** es una herramienta de línea de comandos que te ayuda a configurar y mantener un entorno de flujo de trabajo al estilo bkit en cualquier proyecto. Diagnostica la estructura actual de tu proyecto, reporta lo que falta o está mal configurado, y puede generar automáticamente los archivos faltantes de forma segura y no destructiva.

Este proyecto fue construido usando el mismo flujo de trabajo basado en fases que promueve. Cada funcionalidad fue planificada, diseñada, implementada y verificada usando la metodología exacta que bkit-doctor está diseñado a soportar.

---

## Por qué existe este proyecto

Adoptar un flujo de trabajo de desarrollo nativo con IA es poderoso, pero comenzar puede ser intimidante. Configurar manualmente la estructura de directorios correcta, definiciones de agentes, archivos de habilidades, plantillas y políticas es tedioso y propenso a errores.

**bkit-doctor** existe para reducir esa barrera:

- **Diagnosticar** — ver instantáneamente qué está presente, qué falta y qué necesita atención
- **Recomendar** — después de diagnosticar, sugerir automáticamente qué targets de init ejecutar
- **Inicializar** — generar la estructura correcta en segundos, sin sobrescribir nada que ya exista
- **Aplicación selectiva** — aplicar solo lo que necesitas, una pieza a la vez
- **Previsualizar** — ver exactamente qué cambiará antes de que se escriba algo en el disco
- **Confirmar** — revisar y aprobar el plan antes de aplicarlo

Esta herramienta nació de una idea simple: *el flujo de trabajo debe ser fácil de entrar, no solo fácil de usar una vez que estás dentro.*

---

## Características

| Característica | Descripción |
|----------------|-------------|
| `check` | Diagnosticar el entorno del proyecto — pass / warn / fail por elemento |
| Recomendaciones | Después de check, sugiere qué targets de `init` ejecutar |
| Targets agrupados | Múltiples targets relacionados consolidados (p.ej. `docs-core`) |
| Caché de snapshots | `check` guarda un snapshot de recomendaciones; `init --recommended` lo reutiliza |
| `init` | Generar directorios y archivos faltantes de forma no destructiva |
| `--recommended` | Seleccionar targets de init automáticamente según el estado actual del proyecto |
| `--dry-run` | Ver qué se crearía sin tocar el sistema de archivos |
| `--yes / -y` | Saltar el prompt de confirmación y aplicar inmediatamente |
| `--fresh` | Forzar recomputación de recomendaciones, ignorar caché |
| `--target` | Aplicar solo targets específicos (repetible) |
| `--targets` | Aplicar múltiples targets en un comando (separados por comas) |
| `--overwrite` | Reemplazar archivos existentes cuando sea necesario |
| `--backup` | Hacer copia de seguridad antes de sobrescribir |
| Prompt de confirmación | Muestra el plan de aplicación y pregunta `Continue? (y/N)` |
| Detección de errores tipográficos | `did you mean: docs-report?` cuando el nombre del target tiene un error |
| Multiplataforma | Funciona en macOS y Windows |

---

## Filosofía del flujo de trabajo

bkit-doctor está construido alrededor de un **modelo de desarrollo basado en fases**:

```
PM → PLAN → DESIGN → DO → CHECK → REPORT
```

Cada fase produce un documento. Cada documento vive en una ubicación predecible. Cada pieza de trabajo es trazable desde el requisito hasta la implementación y la verificación.

---

## Relación con bkit

> **bkit-doctor es un proyecto independiente. No es un plugin oficial de bkit y no tiene afiliación oficial con el proyecto bkit.**

bkit-doctor fue **inspirado por bkit** — un potente toolkit de flujo de trabajo de desarrollo nativo con IA.

bkit-doctor:

- **No incluye** código de bkit
- **No requiere** bkit para funcionar
- **No está respaldado** ni mantenido por el equipo de bkit
- Está diseñado para ser útil junto a flujos de trabajo al estilo bkit, no para reemplazar o extender bkit en sí

---

## Instalación

### Requisitos

- Node.js >= 18.0.0
- npm

### Instalar globalmente

```bash
npm install -g bkit-doctor
```

### Ejecutar desde el código fuente

```bash
git clone https://github.com/wpfhak/bkit-doctor.git
cd bkit-doctor
npm install
npm link
```

---

## Uso

```bash
bkit-doctor <command> [options]
```

### Inicio rápido

```bash
# Verificar el entorno bkit de tu proyecto
bkit-doctor check

# Aplicar targets recomendados desde los resultados de check (usa snapshot si está disponible)
bkit-doctor init --recommended

# Previsualizar qué haría init --recommended
bkit-doctor init --recommended --dry-run

# Inicializar la estructura completa (con prompt de confirmación)
bkit-doctor init

# Saltar confirmación y aplicar inmediatamente
bkit-doctor init --yes

# Inicializar solo piezas específicas
bkit-doctor init --target hooks-json --target skills-core
```

---

## Comandos

### `check`

Diagnostica el entorno bkit en el directorio actual (o especificado).
Después del diagnóstico, `check` guarda un snapshot de recomendaciones para que
`init --recommended` pueda reutilizar los resultados sin volver a ejecutar todas las verificaciones.

```
bkit-doctor check [options]

Options:
  -p, --path <dir>   Directorio objetivo (predeterminado: directorio actual)
```

**Ejemplo de salida:**

```
[bkit-doctor] Objetivo de diagnóstico: /path/to/project

──── Categoría ──────────────────────────
  ✗ structure   1 fail
  ! config      2 warn
  ! docs        4 warn
  ...

──── Detalle ──────────────────────────────
[FAIL] structure.claude-root — .claude/ missing
  → run: bkit-doctor init --target claude-root
...

Total 14 — PASS 0 / WARN 12 / FAIL 2   Estado: FAILED

──── Recomendaciones ──────────────────────────────
  8 targets recomendados (basados en 14 problemas)

  • claude-root — crear el directorio raíz .claude/
  • hooks-json  — crear el archivo hooks.json predeterminado
  • docs-core   — crear todos los scaffolds de docs/
    (covers: docs-plan, docs-design, docs-task, docs-report, docs-changelog)

  Siguiente paso recomendado:
  bkit-doctor init --targets claude-root,hooks-json,...,docs-core

  Primero previsualizar:
  bkit-doctor init --targets claude-root,hooks-json,...,docs-core --dry-run
```

---

### `init`

Genera archivos y directorios faltantes. No destructivo por defecto — los archivos existentes nunca se sobreescriben a menos que lo solicites explícitamente.

Antes de aplicar, `init` muestra un resumen del plan y espera `Continue? (y/N)`.
Usa `--dry-run` para previsualizar sin escribir, o `--yes` para saltar la confirmación.

```
bkit-doctor init [options]

Options:
  -p, --path <dir>       Directorio objetivo (predeterminado: directorio actual)
  --dry-run              Mostrar plan sin escribir nada
  --recommended          Seleccionar targets automáticamente según el estado actual del proyecto
  --fresh                Forzar recomputación de recomendaciones (ignorar snapshot)
  -y, --yes              Saltar el prompt de confirmación, aplicar inmediatamente
  --target <name>        Aplicar solo un target específico (repetible)
  --targets <list>       Aplicar múltiples targets, separados por comas
  --overwrite            Permitir sobreescribir archivos existentes
  --backup               Hacer copia de seguridad de archivos existentes antes de sobreescribir
  --backup-dir <dir>     Directorio de copia de seguridad personalizado
```

#### Targets de init disponibles

| Target | Qué crea |
|--------|---------|
| `claude-root` | Directorio raíz `.claude/` |
| `hooks-json` | `.claude/hooks.json` |
| `settings-local` | `.claude/settings.local.json` |
| `agents-core` | 4 archivos de definición de agentes bajo `.claude/agents/` |
| `skills-core` | 6 archivos SKILL.md bajo `.claude/skills/` |
| `templates-core` | 4 plantillas de documentos bajo `.claude/templates/` |
| `policies-core` | 4 archivos de políticas bajo `.claude/policies/` |
| `docs-plan` | `docs/plan.md` |
| `docs-design` | `docs/design.md` |
| `docs-task` | `docs/task.md` |
| `docs-report` | `docs/report.md` |
| `docs-changelog` | `docs/changelog.md` |
| `docs-core` | Todos los docs (alias para todos los targets `docs-*`) |

---

### `version`

Muestra información de versión y plataforma.

```bash
bkit-doctor version
```

---

## Ejemplos

### Verificar y aplicar recomendaciones

```bash
# 1. Diagnosticar — guarda un snapshot de recomendaciones
bkit-doctor check

# 2. Aplicar targets recomendados usando el snapshot en caché
bkit-doctor init --recommended

# O previsualizar primero
bkit-doctor init --recommended --dry-run

# Forzar computación fresca (ignorar snapshot en caché)
bkit-doctor init --recommended --fresh
```

### Previsualizar inicialización (sin escribir nada)

```bash
bkit-doctor init --dry-run

# [bkit-doctor] init: /path/to/project
# [dry-run] no files will be changed
#
#   [MKDIR]    .claude
#   [MKDIR]    .claude/agents
#   [CREATE]   .claude/hooks.json
#   ...
#
# Resumen
#   directories created : 13
#   files created       : 25
#   files skipped       : 0
#
# init completed (dry-run)
# no files changed
```

### Confirmar antes de aplicar

```bash
bkit-doctor init --targets hooks-json,docs-core

# Apply?
#   targets      : hooks-json, docs-core
#   mkdir        : 1
#   create       : 6
#   skip         : 0
#
# Continue? (y/N) y
#
# init completed
```

### Saltar confirmación (CI / automatización)

```bash
bkit-doctor init --yes
bkit-doctor init --recommended --yes
```

### Inicializar solo lo que necesitas

```bash
bkit-doctor init --target docs-report
bkit-doctor init --targets hooks-json,agents-core
bkit-doctor init --target skills-core --dry-run
```

### Sobreescritura segura con copia de seguridad

```bash
bkit-doctor init --overwrite --backup
# Hace copia de seguridad en .bkit-doctor/backups/<timestamp>/
# luego sobreescribe con contenido de scaffold nuevo
```

### Detección de errores tipográficos

```bash
bkit-doctor init --target docs-reprot
# [bkit-doctor] unknown targets:
#   - docs-reprot  (did you mean: docs-report?)
```

---

## Resumen de arquitectura

```
bkit-doctor/
├── src/
│   ├── cli/
│   │   ├── index.js                     # Punto de entrada CLI (commander)
│   │   └── commands/
│   │       ├── check.js                 # Comando check + guardado de snapshot
│   │       ├── init.js                  # Comando init (confirm / recommended / snapshot)
│   │       └── version.js
│   ├── core/
│   │   └── checker.js                   # CheckerRunner
│   ├── checkers/                        # Módulos de diagnóstico (structure, config, agents...)
│   │   └── shared/fileRules.js
│   ├── check/
│   │   ├── resultModel.js               # Tipo CheckResult
│   │   ├── formatters/
│   │   │   └── defaultFormatter.js      # Salida terminal + render de recomendaciones agrupadas
│   │   └── recommendations/
│   │       ├── recommendationModel.js   # Tipo Recommendation
│   │       ├── buildRecommendations.js  # warn/fail → deduplicar + ordenar por prioridad
│   │       ├── groupingRegistry.js      # Política de agrupación padre/hijo
│   │       ├── groupRecommendations.js  # crudo → recomendaciones agrupadas
│   │       ├── buildSuggestedFlow.js    # Recommendation[] → SuggestedFlow
│   │       ├── suggestedFlowModel.js    # Tipo SuggestedFlow
│   │       ├── computeRecommendations.js# async: ejecutar checks → recomendaciones agrupadas
│   │       ├── recommendationSnapshotModel.js
│   │       ├── buildRecommendationFingerprint.js
│   │       ├── saveRecommendationSnapshot.js
│   │       ├── loadRecommendationSnapshot.js
│   │       └── validateRecommendationSnapshot.js
│   ├── init/
│   │   ├── scaffoldManifest.js          # Qué crear (dirs + files + aliases)
│   │   ├── fileTemplates.js             # Contenido mínimo de archivos
│   │   ├── targetRegistry.js            # Nombres de targets + validación + sugerencias de typos
│   │   ├── buildInitPlan.js             # Cálculo del plan (escaneo FS de solo lectura)
│   │   ├── applyInitPlan.js             # Ejecución del plan (escribir / backup / dry-run)
│   │   └── confirmApply.js              # Prompt de confirmación con readline
│   ├── backup/                          # Gestión de sesiones de backup
│   └── shared/
│       └── remediationMap.js            # Mapeo checker id → initTarget
├── .bkit-doctor/
│   └── cache/
│       └── recommendation-snapshot.json # Guardado después de cada check
└── docs/
    ├── 01-plan/
    ├── 02-design/
    ├── 03-task/
    └── 04-report/
```

---

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue antes de enviar un pull request para discutir el cambio propuesto.

1. Haz fork del repositorio
2. Crea una rama de funcionalidad: `git checkout -b feat/your-feature`
3. Idealmente, sigue el flujo de trabajo basado en fases: Plan → Design → Implement → Check
4. Envía un pull request con una descripción clara de qué cambió y por qué

---

## Licencia

Apache License 2.0 — consulta [LICENSE](LICENSE) para los términos completos.

---

## Agradecimientos

- **[bkit](https://github.com/upstageai/bkit)** — por la filosofía de flujo de trabajo que inspiró este proyecto
- La comunidad de código abierto — por las herramientas y patrones en los que se basa este proyecto
- Todos los que creen que el desarrollo estructurado e intencional produce mejores resultados
