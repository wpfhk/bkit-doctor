# bkit-doctor

> Diagnostica, genera estructura y mantiene tu proyecto Claude Code desde la línea de comandos.

![npm version](https://img.shields.io/npm/v/bkit-doctor)
![license](https://img.shields.io/npm/l/bkit-doctor)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/dotoricode/bkit-doctor/pulls)

[English](README.md) | [한국어](README.ko.md) | [日本語](README.ja.md) | [中文](README.zh.md) | **Español**

---

## ¿Qué es bkit-doctor?

**bkit-doctor** verifica que tu proyecto Claude Code tenga la estructura correcta — directorio `.claude/`, hooks, configuración, definiciones de agentes, archivos de skills, plantillas, políticas y estructura de documentación — y corrige automáticamente lo que falte.

Piensa en él como **ESLint para la estructura de tu proyecto Claude Code**: ejecuta 14 verificaciones de diagnóstico, reporta pass/warn/fail para cada elemento, y puede generar todo lo que falte con un solo comando.

```bash
npx bkit-doctor check          # diagnose your project
npx bkit-doctor fix --yes      # auto-fix everything
```

---

## ¿Para quién es?

- **Cualquier usuario de Claude Code** — verifica que tu proyecto tenga la estructura que Claude Code espera (`.claude/`, `CLAUDE.md`, hooks, settings)
- **Equipos que adoptan flujos de trabajo estructurados con IA** — genera agentes, skills, plantillas, políticas y documentación PDCA en segundos
- **Pipelines de CI** — `bkit-doctor check` termina con exit code 1 ante fallos críticos, permitiendo condicionar despliegues al estado del proyecto
- **Usuarios de bkit** — si sigues el flujo de trabajo PDCA de [bkit](https://github.com/anthropics/bkit), bkit-doctor valida y genera el entorno completo

---

## Instalación

```bash
# Run without installing (recommended for trying it out)
npx bkit-doctor check

# Install globally
npm install -g bkit-doctor

# Or add to your project as a dev dependency
npm install --save-dev bkit-doctor
```

Requiere **Node.js >= 18**.

---

## Inicio rápido

```bash
# 1. Diagnose your project
bkit-doctor check

# 2. Auto-fix everything that's missing
bkit-doctor fix --yes

# 3. Verify — should now be HEALTHY
bkit-doctor check
```

---

## Comandos

bkit-doctor ofrece 7 comandos:

### `check` — diagnosticar la estructura del proyecto

Ejecuta 14 verificaciones de diagnóstico y reporta pass/warn/fail para cada elemento. Guarda una instantánea de recomendaciones para su uso posterior con `init --recommended` o `fix`.

```bash
bkit-doctor check                    # check current directory
bkit-doctor check --path ./other     # check a different directory
```

Exit code: **1** si alguna verificación crítica falla, **0** en caso contrario.

### `init` — generar archivos faltantes

Crea directorios y archivos faltantes. No destructivo por defecto — los archivos existentes nunca se sobrescriben a menos que se indique explícitamente con `--overwrite`.

```bash
bkit-doctor init --recommended --yes      # apply recommendations from last check
bkit-doctor init --preset default --yes   # apply a preset bundle
bkit-doctor init --target hooks-json      # scaffold a single target
bkit-doctor init --targets agents-core,docs-core  # multiple targets
bkit-doctor init --recommended --dry-run  # preview without writing
bkit-doctor init --overwrite --backup     # overwrite with backup
```

### `fix` — corrección automática con un solo comando

Atajo para `check` + `recommend` + `init`. Ejecuta el diagnóstico, calcula las recomendaciones y las aplica.

```bash
bkit-doctor fix --yes           # fix everything, no prompts
bkit-doctor fix --dry-run       # preview what would be fixed
bkit-doctor fix --fresh --yes   # ignore snapshot, recompute
```

### `preset` — paquetes de estructura predefinidos

Los presets seleccionan qué targets generar y afectan el contenido de los archivos generados.

```bash
bkit-doctor preset list              # show available presets
bkit-doctor preset show default      # show preset details
bkit-doctor preset recommend         # recommend preset for current project
```

Presets disponibles:

| Preset | Descripción | Targets |
|--------|-------------|---------|
| `default` | Estructura completa (config + agents + skills + templates + policies + docs) | 8 targets |
| `lean` | Estructura mínima (config + agents solamente) | 4 targets |
| `workflow-core` | Estructura de flujo de trabajo (agents + skills + templates + policies) | 5 targets |
| `docs` | Solo documentación (plan, design, task, report, changelog) | 1 target |

El contenido varía según el preset: `default` genera roles de agente detallados y descripciones completas de skills; `lean` genera marcadores de posición compactos.

### `save` / `load` — persistir y compartir configuración

Guarda tu modo predeterminado preferido (recommended o preset) de forma local o global, y vuelve a aplicarlo más tarde o compártelo entre proyectos.

```bash
bkit-doctor save --local --recommended    # save preference locally
bkit-doctor save --global --preset lean   # save globally (all projects)
bkit-doctor save --both --preset default  # save to both

bkit-doctor load --local                  # re-apply saved settings
bkit-doctor load --global                 # apply global to current project
bkit-doctor load --file ./settings.json   # apply from a specific file
```

### `version` — mostrar información de versión

```bash
bkit-doctor version       # version + platform details
bkit-doctor --version     # version number only
```

---

## Qué se verifica (14 elementos)

| Categoría | Verificación | Severidad |
|-----------|-------------|-----------|
| structure | El directorio `.claude/` existe | **hard** (exit 1 si falta) |
| config | `CLAUDE.md` existe | **hard** (exit 1 si falta) |
| config | `.claude/hooks.json` existe | soft |
| config | `.claude/settings.local.json` existe | soft |
| docs | `docs/01-plan/` a `docs/04-report/` (4 verificaciones) | soft |
| agents | 4 archivos de definición de agente requeridos | soft |
| skills | 7 archivos SKILL.md requeridos | soft |
| policies | 4 archivos de política requeridos | soft |
| templates | 4 archivos de plantilla requeridos | soft |
| context | Directorio `.claude/context/` | soft |
| changelog | `CHANGELOG.md` (3 rutas candidatas) | soft |

Las verificaciones **hard** hacen que `check` termine con exit code 1. Las verificaciones **soft** producen advertencias pero terminan con exit code 0.

---

## Uso en CI

`bkit-doctor check` devuelve exit code 1 cuando falta estructura crítica, lo que lo hace ideal para gates de CI:

```bash
# GitHub Actions example
- name: Check Claude Code project health
  run: npx bkit-doctor check --path .

# Shell script
bkit-doctor check || { echo "Project health check failed"; exit 1; }
```

---

## Targets de init disponibles

| Target | Qué crea |
|--------|----------|
| `claude-root` | Directorio raíz `.claude/` |
| `hooks-json` | `.claude/hooks.json` |
| `settings-local` | `.claude/settings.local.json` |
| `agents-core` | 4 archivos de definición de agente en `.claude/agents/` |
| `skills-core` | 7 archivos SKILL.md de skills en `.claude/skills/` |
| `templates-core` | 4 plantillas de documentos en `.claude/templates/` |
| `policies-core` | 4 archivos de políticas en `.claude/policies/` |
| `docs-plan` | Directorio `docs/01-plan/` |
| `docs-design` | Directorio `docs/02-design/` |
| `docs-task` | Directorio `docs/03-task/` |
| `docs-report` | Directorio `docs/04-report/` |
| `docs-changelog` | `CHANGELOG.md` |
| `docs-core` | Todos los docs (alias para todos los targets `docs-*`) |

---

## ¿Qué es bkit?

[bkit](https://github.com/anthropics/bkit) es un framework de flujo de trabajo de desarrollo basado en PDCA para Claude Code. Proporciona fases estructuradas (Plan, Design, Do, Check, Report), equipos de agentes y puertas de calidad para el desarrollo nativo con IA.

**bkit-doctor funciona con o sin bkit:**

| Funcionalidad | Sin bkit | Con bkit |
|---------------|:---:|:---:|
| `check` — diagnóstico de estructura del proyecto | Yes | Yes |
| `init` — generar archivos faltantes | Yes | Yes |
| `fix` — corrección automática | Yes | Yes |
| `preset` — paquetes optimizados para flujos de trabajo | Partial | Full |
| `save` / `load` — persistencia de configuración | Yes | Yes |

Los comandos principales (`check`, `init`, `fix`) son útiles para cualquier proyecto Claude Code. Los presets y targets avanzados de scaffolding están optimizados para el flujo de trabajo PDCA de bkit.

---

## Arquitectura

```
bkit-doctor/
├── src/
│   ├── cli/
│   │   ├── index.js              # CLI entry point (commander)
│   │   └── commands/             # check, init, fix, preset, save, load, version
│   ├── core/
│   │   └── checker.js            # CheckerRunner — registers and runs diagnostics
│   ├── checkers/                 # 14 diagnostic modules
│   │   └── shared/fileRules.js   # findMissingFiles, hasAnyFile utilities
│   ├── check/
│   │   ├── resultModel.js        # CheckResult type
│   │   ├── formatters/           # terminal output renderer
│   │   └── recommendations/      # recommendation engine + snapshot cache
│   ├── init/                     # scaffold manifest, plan builder, apply logic
│   ├── fix/                      # resolveFixTargets — snapshot-aware remediation
│   ├── preset/                   # preset scoring + recommendation
│   ├── config/                   # save/load settings (local + global)
│   ├── backup/                   # backup session management
│   └── shared/
│       └── remediationMap.js     # checker id → initTarget mapping
├── tests/                        # 167 tests (node:test)
├── scripts/
│   └── verify-release.js         # 38-check release verification
└── docs/                         # PDCA phase documents (plan, design, task, report)
```

---

## Relación con bkit

> **bkit-doctor es un proyecto independiente.** No es un plugin oficial de bkit y no tiene afiliación con el equipo de bkit.

bkit-doctor se inspiró en [bkit](https://github.com/anthropics/bkit) — un flujo de trabajo de desarrollo nativo con IA basado en PDCA. El autor aprendió la colaboración estructurada con IA a través de los materiales de bkit, y ese conocimiento dio forma al diseño de esta herramienta.

bkit-doctor **no** incluye código de bkit, **no** requiere bkit para funcionar, y **no** está respaldado ni mantenido por el equipo de bkit.

---

## Contribuciones

Las contribuciones son bienvenidas. Por favor abre un issue antes de enviar un pull request para discutir el cambio propuesto.

1. Haz fork del repositorio
2. Crea una rama de feature: `git checkout -b feat/your-feature`
3. Idealmente, sigue el flujo de trabajo basado en fases: Plan → Design → Implement → Check
4. Envía un pull request con una descripción clara de qué cambió y por qué

---

## Licencia

Apache License 2.0 — consulta [LICENSE](LICENSE) para los términos completos.

---

## Agradecimientos

- **[bkit](https://github.com/anthropics/bkit)** — por la filosofía de flujo de trabajo que inspiró este proyecto
- La comunidad open-source — por las herramientas y patrones sobre los que se construye este proyecto
