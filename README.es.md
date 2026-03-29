# bkit-doctor

> Diagnostica, estructura y mantén tu proyecto Claude Code desde la línea de comandos.

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![Version](https://img.shields.io/badge/version-0.7.0-orange.svg)](CHANGELOG.md)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/dotoricode/bkit-doctor/pulls)

[English](README.md) | [한국어](README.ko.md) | [日本語](README.ja.md) | [中文](README.zh.md) | **Español**

---

## ¿Qué es bkit-doctor?

**bkit-doctor** verifica si tu proyecto Claude Code tiene la estructura correcta — directorio `.claude/`, hooks, settings, definiciones de agentes, archivos de skills, plantillas, políticas y scaffolds de documentación — y corrige automáticamente lo que falte.

Piensa en él como un **ESLint para la estructura de tu proyecto Claude Code**: ejecuta 14 verificaciones de diagnóstico, reporta pass/warn/fail por cada elemento, y puede generar todo lo que falta con un solo comando.

```bash
npx bkit-doctor check          # diagnosticar tu proyecto
npx bkit-doctor fix --yes      # corregir todo automáticamente
```

---

## ¿Para quién es?

- **Cualquier usuario de Claude Code** — verifica que tu proyecto tenga la estructura que Claude Code espera (`.claude/`, `CLAUDE.md`, hooks, settings)
- **Equipos que adoptan flujos de trabajo de IA estructurados** — genera agentes, skills, plantillas, políticas y documentación PDCA en segundos
- **Pipelines de CI** — `bkit-doctor check` sale con código 1 en fallos críticos, permitiendo condicionar despliegues a la salud del proyecto
- **Usuarios de bkit** — si sigues el flujo de trabajo PDCA de [bkit](https://github.com/anthropics/bkit), bkit-doctor valida e inicializa todo el entorno

---

## ¿Qué problema resuelve?

Configurar correctamente un proyecto Claude Code implica crear los directorios, archivos de configuración, definiciones de agentes, archivos de skills y scaffolds de documentación adecuados. Hacerlo manualmente es tedioso y propenso a errores. Olvidar un solo archivo puede romper hooks, desactivar skills o dejar a los asistentes de IA sin contexto.

**bkit-doctor** automatiza esto:

- **Diagnosticar** — ver al instante qué existe, qué falta y qué necesita atención
- **Recomendar** — sugerir automáticamente qué elementos inicializar según el estado actual
- **Corregir** — generar la estructura correcta con un solo comando, sin sobrescribir nada existente
- **Previsualizar** — ver exactamente qué cambiará antes de que se escriba en disco (`--dry-run`)
- **Verificar** — ejecutar en CI para asegurar que la estructura del proyecto se mantenga saludable

---

## ¿Qué es bkit?

[bkit](https://github.com/anthropics/bkit) es un framework de flujo de trabajo de desarrollo basado en PDCA para Claude Code. Proporciona fases estructuradas (Plan, Design, Do, Check, Report), equipos de agentes y puertas de calidad para el desarrollo nativo con IA.

**bkit-doctor funciona con o sin bkit:**

| Capacidad | Sin bkit | Con bkit |
|-----------|:---:|:---:|
| `check` — diagnóstico de estructura del proyecto | Yes | Yes |
| `init` — scaffold de archivos faltantes | Yes | Yes |
| `fix` — corrección automática | Yes | Yes |
| `preset` — bundles optimizados para flujos de trabajo | Parcial | Completo |
| `save` / `load` — persistencia de configuración | Yes | Yes |

Los comandos principales (`check`, `init`, `fix`) son útiles para cualquier proyecto Claude Code. Los presets y los targets de scaffolding avanzado están optimizados para el flujo de trabajo PDCA de bkit.

---

## Funcionalidades

| Funcionalidad | Descripción |
|---------------|-------------|
| `check` | Diagnosticar el entorno del proyecto — pass / warn / fail por elemento |
| `init` | Generar directorios y archivos faltantes de forma no destructiva |
| `fix` | Corrección automática con un solo comando (check + recommend + init) |
| `preset` | Aplicar bundles predefinidos (`default`, `lean`, `docs`) |
| `save` / `load` | Guardar y compartir configuración del equipo |
| Recomendaciones | Después de check, muestra qué targets de `init` ejecutar |
| Targets agrupados | Targets relacionados consolidados (ej. `docs-core` = todos los directorios docs) |
| Caché de snapshot | `check` almacena resultados en caché; `init --recommended` los reutiliza |
| `--dry-run` | Previsualizar cambios sin tocar el sistema de archivos |
| `--yes / -y` | Omitir confirmación (compatible con CI) |
| `--overwrite` / `--backup` | Reemplazo seguro de archivos con respaldo |
| Sugerencias de errores tipográficos | `did you mean: docs-report?` cuando se escribe mal un nombre de target |
| Exit codes | Exit 1 en fallos críticos (integración con pipelines de CI) |
| Multiplataforma | Funciona en macOS y Windows |

---

## Qué se verifica (14 elementos)

| Categoría | Verificación | Severidad |
|-----------|-------------|-----------|
| structure | El directorio `.claude/` existe | **hard** (exit 1 si falta) |
| config | `CLAUDE.md` existe | **hard** (exit 1 si falta) |
| config | `.claude/hooks.json` existe | soft |
| config | `.claude/settings.local.json` existe | soft |
| docs | `docs/01-plan/` a `docs/04-report/` (4 verificaciones) | soft |
| agents | 4 archivos de definición de agentes requeridos | soft |
| skills | 7 archivos SKILL.md requeridos | soft |
| policies | 4 archivos de políticas requeridos | soft |
| templates | 4 archivos de plantillas requeridos | soft |
| context | Directorio `.claude/context/` | soft |
| changelog | `CHANGELOG.md` (3 rutas candidatas) | soft |

Las verificaciones **hard** hacen que `check` termine con código 1. Las verificaciones **soft** producen advertencias pero terminan con código 0.

---

## Relación con bkit

> **bkit-doctor es un proyecto independiente.** No es un plugin oficial de bkit y no tiene afiliación con el equipo de bkit.

bkit-doctor se inspiró en [bkit](https://github.com/anthropics/bkit) — un flujo de trabajo de desarrollo nativo con IA basado en PDCA. El autor aprendió sobre colaboración estructurada con IA a través de los materiales de bkit, y ese conocimiento dio forma al diseño de esta herramienta.

bkit-doctor **no** incluye código de bkit, **no** requiere bkit para funcionar, y **no** está respaldado ni mantenido por el equipo de bkit. Está diseñado para ser útil junto con flujos de trabajo al estilo bkit.

---

## Agradecimientos

Un agradecimiento especial al **proyecto bkit** por la filosofía de flujo de trabajo que inspiró esta herramienta. La claridad de Plan, Design, Do, Check — y la idea de que la colaboración con IA funciona mejor con contexto estructurado — influyó directamente en el diseño de bkit-doctor.

---

## Instalación

### Requisitos

- Node.js >= 18.0.0
- npm

### Instalación global

```bash
npm install -g bkit-doctor
```

### Ejecutar desde el código fuente

```bash
git clone https://github.com/dotoricode/bkit-doctor.git
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
# Diagnosticar la estructura de tu proyecto Claude Code
bkit-doctor check

# Corregir automáticamente todo lo que falta
bkit-doctor fix --yes

# O paso a paso: previsualizar primero, luego aplicar
bkit-doctor init --recommended --dry-run
bkit-doctor init --recommended --yes

# Inicializar solo piezas específicas
bkit-doctor init --target hooks-json --target skills-core

# Usar en CI (sale con código 1 si fallan verificaciones críticas)
bkit-doctor check --path ./my-project
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
  -p, --path <dir>   Directorio objetivo (por defecto: directorio actual)
```

**Ejemplo de salida:**

```
[bkit-doctor] 진단 대상: /path/to/project

──── 카테고리 ──────────────────────────
  ✗ structure   1 fail
  ! config      2 warn
  ! docs        4 warn
  ...

──── 상세 ──────────────────────────────
[FAIL] structure.claude-root — .claude/ missing
  → run: bkit-doctor init --target claude-root
...

총 14개 — PASS 0 / WARN 12 / FAIL 2   상태: FAILED

──── 추천 ──────────────────────────────
  8개 추천 target (14개 문제 기반)

  • claude-root — create the .claude/ root directory
  • hooks-json  — create the default hooks.json file
  • docs-core   — create all docs/ scaffolds (plan, design, task, report, changelog)
    (covers: docs-plan, docs-design, docs-task, docs-report, docs-changelog)

  Recommended next step:
  bkit-doctor init --targets claude-root,hooks-json,...,docs-core

  Preview first:
  bkit-doctor init --targets claude-root,hooks-json,...,docs-core --dry-run
```

Cada elemento se califica como `pass`, `warn` o `fail`. La sección de recomendaciones muestra qué targets de `init` resuelven los problemas, con targets relacionados agrupados (ej. todos los `docs-*` → `docs-core`).

---

### `init`

Genera archivos y directorios faltantes. No destructivo por defecto — los archivos existentes nunca se sobrescriben a menos que se solicite explícitamente.

Antes de aplicar, `init` muestra un resumen del plan y pregunta `Continue? (y/N)`.
Usa `--dry-run` para previsualizar sin escribir, o `--yes` para omitir la confirmación.

```
bkit-doctor init [options]

Options:
  -p, --path <dir>       Directorio objetivo (por defecto: directorio actual)
  --dry-run              Mostrar plan sin escribir nada
  --recommended          Seleccionar targets automáticamente según el estado del proyecto
  --fresh                Forzar recálculo de recomendaciones (ignorar snapshot)
  -y, --yes              Omitir confirmación, aplicar inmediatamente
  --target <name>        Aplicar solo un target específico (repetible)
  --targets <list>       Aplicar múltiples targets, separados por comas
  --overwrite            Permitir sobrescritura de archivos existentes
  --backup               Respaldar archivos existentes antes de sobrescribir
  --backup-dir <dir>     Directorio de respaldo personalizado
```

#### Targets de init disponibles

| Target | Qué crea |
|--------|----------|
| `claude-root` | Directorio raíz `.claude/` |
| `hooks-json` | `.claude/hooks.json` |
| `settings-local` | `.claude/settings.local.json` |
| `agents-core` | 4 archivos de definición de agentes en `.claude/agents/` |
| `skills-core` | 6 archivos SKILL.md de skills en `.claude/skills/` |
| `templates-core` | 4 plantillas de documentos en `.claude/templates/` |
| `policies-core` | 4 archivos de políticas en `.claude/policies/` |
| `docs-plan` | `docs/plan.md` |
| `docs-design` | `docs/design.md` |
| `docs-task` | `docs/task.md` |
| `docs-report` | `docs/report.md` |
| `docs-changelog` | `docs/changelog.md` |
| `docs-core` | Todos los docs (alias para todos los targets `docs-*`) |

---

### `fix`

Corrección automática con un solo comando. Ejecuta `check`, calcula recomendaciones y las aplica.

```
bkit-doctor fix [options]

Options:
  -p, --path <dir>   Directorio objetivo (por defecto: directorio actual)
  --dry-run          Mostrar plan sin escribir nada
  --fresh            Forzar recálculo (ignorar snapshot)
  -y, --yes          Omitir confirmación
```

### `preset`

Aplica bundles de scaffold predefinidos.

```bash
bkit-doctor preset list              # mostrar presets disponibles
bkit-doctor preset show default      # mostrar detalles del preset
bkit-doctor preset recommend         # recomendar preset para el proyecto actual
bkit-doctor init --preset lean --yes # aplicar un preset
```

### `save` / `load`

Guardar y compartir configuración predeterminada.

```bash
bkit-doctor save --local --recommended    # guardar preferencia localmente
bkit-doctor save --global --preset lean   # guardar globalmente
bkit-doctor load --local                  # reaplicar configuración guardada
bkit-doctor load --global                 # aplicar configuración global al proyecto actual
```

### `version`

Muestra información de versión y plataforma.

```bash
bkit-doctor version
```

---

## Ejemplos

```bash
# Diagnosticar → corregir automáticamente → verificar
bkit-doctor check                          # ver qué falta
bkit-doctor fix --yes                      # corregir todo
bkit-doctor check                          # verificar: debería ser HEALTHY

# Previsualizar antes de aplicar
bkit-doctor init --recommended --dry-run   # ver qué cambiaría
bkit-doctor init --recommended --yes       # aplicar

# Scaffolding selectivo
bkit-doctor init --target hooks-json       # un solo target
bkit-doctor init --targets hooks-json,docs-core  # múltiples targets

# Sobrescritura segura con respaldo
bkit-doctor init --overwrite --backup      # respalda en .bkit-doctor/backups/

# Integración con pipeline de CI
bkit-doctor check --path ./my-project && echo "healthy" || echo "needs fix"

# Flujo de trabajo de configuración de equipo
bkit-doctor save --global --preset default # el líder del equipo guarda el estándar
bkit-doctor load --global                  # el miembro del equipo lo aplica
```

---

## Arquitectura general

```
bkit-doctor/
├── src/
│   ├── cli/
│   │   ├── index.js              # Punto de entrada CLI (commander)
│   │   └── commands/             # check, init, fix, preset, save, load, version
│   ├── core/
│   │   └── checker.js            # CheckerRunner — registra y ejecuta diagnósticos
│   ├── checkers/                 # 14 módulos de diagnóstico (structure, config, docs, agents...)
│   │   └── shared/fileRules.js   # Utilidades findMissingFiles, hasAnyFile
│   ├── check/
│   │   ├── resultModel.js        # Tipo CheckResult
│   │   ├── formatters/           # Renderizador de salida en terminal
│   │   └── recommendations/      # Motor de recomendaciones + caché de snapshot
│   ├── init/                     # Manifiesto de scaffold, constructor de plan, lógica de aplicación
│   ├── fix/                      # resolveFixTargets — corrección con reconocimiento de snapshot
│   ├── preset/                   # Puntuación de presets + recomendación
│   ├── config/                   # Guardar/cargar configuración (local + global)
│   ├── backup/                   # Gestión de sesiones de respaldo
│   └── shared/
│       └── remediationMap.js     # Mapeo checker id → initTarget
├── tests/                        # 167 tests (node:test)
├── scripts/
│   └── verify-release.js         # Verificación de release con 38 comprobaciones
└── docs/                         # Documentos de fases PDCA (plan, design, task, report)
```

---

## Metodología de desarrollo

Este proyecto fue construido usando el mismo flujo de trabajo PDCA que promueve. Cada funcionalidad tiene documentos de Plan, Design, Task y Report en `docs/`. Esto asegura que los cambios sean intencionales, documentados y trazables.

---

## Contribuir

Las contribuciones son bienvenidas. Por favor abre un issue antes de enviar un pull request para discutir el cambio propuesto.

1. Haz fork del repositorio
2. Crea una rama de funcionalidad: `git checkout -b feat/your-feature`
3. Idealmente, sigue el flujo de trabajo basado en fases: Plan → Design → Implement → Check
4. Envía un pull request con una descripción clara de qué cambió y por qué

---

## Licencia

Apache License 2.0 — consulta [LICENSE](LICENSE) para los términos completos.

---

## Agradecimientos

- **[bkit](https://github.com/anthropics/bkit)** — por la filosofía de flujo de trabajo que inspiró este proyecto
- La comunidad de código abierto — por las herramientas y patrones sobre los que se construye este proyecto
