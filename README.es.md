# bkit-doctor

> Herramienta CLI que diagnostica la estructura de proyectos creados con herramientas de IA y la corrige automáticamente.

[![npm version](https://img.shields.io/npm/v/bkit-doctor)](https://www.npmjs.com/package/bkit-doctor)
[![license](https://img.shields.io/npm/l/bkit-doctor)](https://github.com/dotoricode/bkit-doctor/blob/main/LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/dotoricode/bkit-doctor/pulls)

[English](./README.md) | [한국어](./README.ko.md) | [日本語](./README.ja.md) | [中文](./README.zh.md) | **Español**

---

## ¿Qué es bkit-doctor?

Cuando construyes proyectos con herramientas de IA como Claude Code o Cursor, la estructura tiende a desorganizarse. Faltan archivos de contexto, los directorios de documentación no existen o los archivos de configuración están ausentes. Con el tiempo, la IA pierde el contexto estructurado que necesita para ser efectiva.

**bkit-doctor** diagnostica estos problemas con un solo comando y los corrige automáticamente. Verifica que tu proyecto tenga la estructura necesaria — directorio `.claude/`, hooks, settings, definiciones de agentes, archivos de skills, plantillas, políticas y documentación — y crea automáticamente lo que falta.

Piensa en él como **ESLint para la estructura de tu proyecto**: 14 diagnósticos, pass/warn/fail por elemento, corrección automática con un solo comando.

```bash
npx bkit-doctor check          # diagnosticar proyecto
npx bkit-doctor fix --yes      # corregir todo automáticamente
```

bkit-doctor está construido sobre la metodología de flujo de trabajo PDCA de [bkit](https://github.com/popup-studio-ai/bkit-claude-code), pero funciona de forma independiente — no requiere instalar bkit.

---

## Inicio rápido: Configurar un nuevo proyecto con bkit

> bkit-doctor por sí solo es útil, pero combinarlo con [bkit](https://github.com/popup-studio-ai/bkit-claude-code) desbloquea el flujo de trabajo PDCA completo, 31 agentes y 36 skills en Claude Code.

### Step 1 — Generar la estructura del proyecto con bkit-doctor

Ejecuta los siguientes comandos dentro del directorio de tu nuevo proyecto.

```bash
# 1. Diagnosticar el proyecto (en proyectos nuevos muchos items darán warn/fail — es normal)
npx bkit-doctor check

# 2. Generar automáticamente toda la estructura faltante
npx bkit-doctor init --preset default --yes

# 3. Volver a diagnosticar y confirmar estado HEALTHY
npx bkit-doctor check
```

Después de este paso, tu proyecto tendrá el siguiente **esqueleto de directorios y archivos**:

```
your-project/
├── .claude/
│   ├── hooks.json
│   ├── settings.local.json
│   ├── agents/          ← archivos de definición de agentes (marcadores de posición)
│   ├── skills/          ← archivos de skills (marcadores de posición)
│   ├── templates/       ← plantillas de documentos
│   └── policies/        ← archivos de políticas
├── docs/
│   ├── 01-plan/
│   ├── 02-design/
│   ├── 03-task/
│   └── 04-report/
├── CLAUDE.md
└── CHANGELOG.md
```

> **Este es solo un esqueleto.** Los archivos dentro de `.claude/agents/` y `.claude/skills/` son marcadores de posición. La lógica real de agentes y skills de bkit aún no está incluida — eso viene en el siguiente paso.

---

### Step 2 — Instalar el plugin de bkit en Claude Code

Las capacidades reales de bkit — flujo de trabajo PDCA, equipos de agentes CTO, puertas de calidad y más — se ejecutan como un **plugin de Claude Code**. Abre Claude Code y ejecuta:

```
# Ejecutar dentro del terminal de Claude Code
/plugin marketplace add popup-studio-ai/bkit-claude-code
/plugin install bkit
```

Una vez instalado, Claude Code guarda el plugin en `~/.claude/plugins/bkit/`. A partir de este momento, los 36 skills y 31 agentes de bkit estarán activos automáticamente en todos los proyectos.

---

### Step 3 — Iniciar tu primera sesión de desarrollo

En Claude Code con el plugin de bkit instalado, inicia el flujo de trabajo PDCA con:

```
# Iniciar el desarrollo de una nueva funcionalidad (p. ej. login)
/pdca plan login-feature

# Generar el documento de diseño
/pdca design login-feature

# Implementar
/pdca do login-feature

# Verificar y analizar brechas
/pdca analyze login-feature
```

Los documentos se escriben en la estructura de directorio `docs/` que bkit-doctor creó.

---

### Cómo se relacionan las dos herramientas

```
bkit-doctor                       bkit (plugin de Claude Code)
──────────────────────────        ──────────────────────────────────
Crea el esqueleto del proyecto    Impulsa el motor de flujo de trabajo IA
Estructura del directorio .claude/ 36 skills / 31 agentes
Diseño de documentos docs/        Máquina de estados PDCA
Configuración hooks.json          Puertas de calidad / registro de auditoría
Archivo de contexto CLAUDE.md     Equipos de Agentes Liderados por CTO
```

bkit-doctor es una **herramienta de configuración única**. Después de eso, bkit gestiona todo dentro de Claude Code.

---

## Instalación

```bash
# Ejecutar sin instalar (recomendado para probarlo)
npx bkit-doctor check

# Instalar globalmente
npm install -g bkit-doctor

# O añadir como dependencia de desarrollo del proyecto
npm install --save-dev bkit-doctor
```

Requiere **Node.js >= 18**.

### Ejecutar desde el código fuente

```bash
git clone https://github.com/dotoricode/bkit-doctor.git
cd bkit-doctor
npm install
npm link
```

---

## Comandos

bkit-doctor ofrece 8 comandos.

### `check` — diagnosticar la estructura del proyecto

Ejecuta 14 verificaciones de diagnóstico y reporta pass/warn/fail para cada elemento. Guarda una instantánea de recomendaciones para su uso posterior con `init --recommended` o `fix`.

```bash
bkit-doctor check                    # verificar directorio actual
bkit-doctor check --path ./other     # verificar un directorio diferente
```

Exit code: **1** si alguna verificación crítica falla, **0** en caso contrario.

**Ejemplo de salida:**

```
[bkit-doctor] target: /path/to/project

──── categories ────────────────────────
  ✗ structure   1 fail
  ! config      2 warn
  ✓ docs        4 pass

──── details ───────────────────────────
[FAIL] structure.claude-root — .claude/ missing
[WARN] config.hooks-json — .claude/hooks.json missing
[PASS] docs.plan — docs/01-plan exists

14 total — PASS 8 / WARN 4 / FAIL 2   status: FAILED

──── recommendations ───────────────────
  bkit-doctor init --targets claude-root,hooks-json,...
```

### `init` — generar archivos faltantes

Crea directorios y archivos faltantes. No destructivo por defecto — los archivos existentes nunca se sobrescriben a menos que se indique explícitamente con `--overwrite`.

```bash
bkit-doctor init --recommended --yes      # aplicar recomendaciones del último check
bkit-doctor init --preset default --yes   # aplicar un paquete de preset
bkit-doctor init --target hooks-json      # generar un único objetivo
bkit-doctor init --targets agents-core,docs-core  # múltiples objetivos
bkit-doctor init --recommended --dry-run  # previsualizar sin escribir
bkit-doctor init --overwrite --backup     # sobrescribir con copia de seguridad
```

### `fix` — corrección automática con un solo comando

Atajo para `check` + `recommend` + `init`. Ejecuta el diagnóstico, calcula las recomendaciones y las aplica.

```bash
bkit-doctor fix --yes           # corregir todo sin confirmaciones
bkit-doctor fix --dry-run       # previsualizar la corrección
bkit-doctor fix --fresh --yes   # ignorar instantánea y recalcular
```

### `preset` — paquetes de estructura predefinidos

Los presets seleccionan qué objetivos generar y afectan el contenido de los archivos generados.

```bash
bkit-doctor preset list              # mostrar presets disponibles
bkit-doctor preset show default      # mostrar detalles del preset
bkit-doctor preset recommend         # recomendar preset para el proyecto actual
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
bkit-doctor save --local --recommended    # guardar preferencia localmente
bkit-doctor save --global --preset lean   # guardar globalmente (todos los proyectos)
bkit-doctor save --both --preset default  # guardar en ambos

bkit-doctor load --local                  # re-aplicar configuración guardada
bkit-doctor load --global                 # aplicar configuración global al proyecto actual
bkit-doctor load --file ./settings.json   # aplicar desde un archivo específico
```

### `pdca` — generar documento guía PDCA

Genera un documento guía PDCA (Plan-Do-Check-Act) estructurado para cualquier tema. La salida es un archivo Markdown con marcadores de posición listos para editar.

```bash
bkit-doctor pdca "Criterios de Aprobación de Despliegue"          # generar guía
bkit-doctor pdca "Respuesta a Fallos de Pago" --stdout            # imprimir en terminal
bkit-doctor pdca "Checklist de Operaciones" --overwrite           # sobrescribir existente
bkit-doctor pdca "Checklist de Release" -o docs/custom.md         # ruta de salida personalizada
bkit-doctor pdca "Funcionalidad Login" --type feature --owner alice --priority P0
```

**Ruta de salida predeterminada:** `docs/00-pdca/<slug>-pdca-guide.md`

**Opciones:**

| Opción | Descripción | Predeterminado |
|--------|-------------|----------------|
| `-p, --path <dir>` | Directorio raíz del proyecto | `cwd` |
| `-o, --output <file>` | Ruta de archivo de salida personalizada | — |
| `--stdout` | Imprimir en stdout en lugar de escribir archivo | — |
| `--overwrite` | Sobrescribir archivo existente | — |
| `--type <kind>` | `guideline` / `feature` / `bugfix` / `refactor` | `guideline` |
| `--owner <name>` | Nombre del responsable | `TBD` |
| `--priority <level>` | Prioridad (`P0` / `P1` / `P2` / `P3`) | `P1` |

**Alcance (v1):** Generación basada en plantillas únicamente. Sin flujo de trabajo PDCA con estado, sin generación por IA, sin subcomandos multi-paso.

### `version` — mostrar información de versión

```bash
bkit-doctor version       # versión + detalles de plataforma
bkit-doctor --version     # solo número de versión
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

```yaml
# GitHub Actions
- name: Verificar estructura del proyecto
  run: npx bkit-doctor check
```

```bash
# Script shell
bkit-doctor check || { echo "Verificación de estructura fallida"; exit 1; }
```

Comportamiento del exit code:

- **Hard FAIL** (`.claude/` o `CLAUDE.md` ausente) → exit 1, CI falla
- **Soft FAIL** (solo advertencias) → exit 0, CI pasa

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

## FAQ

**Q: Ejecuté `init --preset default` pero las funciones de bkit no funcionan.**

A: bkit-doctor crea la **estructura de archivos** de tu proyecto. Las funciones reales de bkit — flujo de trabajo PDCA, agentes, skills — se ejecutan como un **plugin de Claude Code** y deben instalarse por separado. Abre Claude Code y ejecuta:

```
/plugin marketplace add popup-studio-ai/bkit-claude-code
/plugin install bkit
```

**Q: Aparecieron archivos en `.claude/agents/` — ¿son los agentes de bkit?**

A: No. Los archivos de agentes que genera bkit-doctor son **marcadores de posición**. Los 31 agentes reales de bkit están dentro del plugin de Claude Code (`~/.claude/plugins/bkit/agents/`). Los archivos que crea bkit-doctor son útiles como referencia al escribir tus propios agentes personalizados.

**Q: ¿Necesito instalar bkit?**

A: No. bkit-doctor es una herramienta CLI independiente y funciona sin bkit. Si quieres usar los comandos de flujo de trabajo `/pdca` y los equipos de agentes de bkit, instala el plugin de bkit en Claude Code.

**Q: ¿Sobrescribirá mis archivos existentes?**

A: No por defecto. Debes pasar explícitamente `--overwrite`. Combínalo con `--backup` para hacer una copia de seguridad de los archivos existentes antes de sobrescribirlos.

**Q: ¿Cómo puedo previsualizar qué se creará?**

A: Usa `--dry-run`. No se escribe nada en disco.

```bash
bkit-doctor init --recommended --dry-run
bkit-doctor fix --dry-run
```

**Q: ¿Puedo usarlo en CI?**

A: Sí. `check` devuelve exit code 1 cuando falta la estructura principal, por lo que funciona como gate de CI.

---

## ¿Qué es bkit?

[bkit](https://github.com/popup-studio-ai/bkit-claude-code) (Vibecoding Kit) es un framework de flujo de trabajo de desarrollo basado en PDCA para Claude Code. Proporciona fases estructuradas (Plan, Design, Do, Check, Report), equipos de agentes y puertas de calidad para el desarrollo nativo con IA.

**bkit-doctor funciona con o sin bkit:**

| Funcionalidad | Sin bkit | Con bkit |
|---------------|:--------:|:--------:|
| `check` — diagnóstico de estructura del proyecto | ✅ | ✅ |
| `init` — generar archivos faltantes | ✅ | ✅ |
| `fix` — corrección automática | ✅ | ✅ |
| `preset` — paquetes optimizados para flujos de trabajo | Partial | Full |
| Comandos de flujo de trabajo `/pdca` | ❌ | ✅ |
| 31 agentes / 36 skills | ❌ | ✅ |
| Puertas de calidad PDCA / registro de auditoría | ❌ | ✅ |

Más información sobre bkit: https://github.com/popup-studio-ai/bkit-claude-code

---

## Arquitectura

```
bkit-doctor/
├── src/
│   ├── cli/
│   │   ├── index.js              # Punto de entrada CLI (commander)
│   │   └── commands/             # check, init, fix, preset, save, load, version
│   ├── core/
│   │   └── checker.js            # CheckerRunner — registra y ejecuta diagnósticos
│   ├── checkers/                 # 14 módulos de diagnóstico
│   │   └── shared/fileRules.js   # Utilidades findMissingFiles, hasAnyFile
│   ├── check/
│   │   ├── resultModel.js        # Tipo CheckResult
│   │   ├── formatters/           # Renderizador de salida de terminal
│   │   └── recommendations/      # Motor de recomendaciones + caché de instantáneas
│   ├── init/                     # Manifiesto scaffold, constructor de plan, lógica de aplicación
│   ├── fix/                      # resolveFixTargets — corrección con conocimiento de instantáneas
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

## Relación con bkit

> **bkit-doctor es un proyecto independiente.** No es un plugin oficial de bkit y no tiene afiliación con el equipo de bkit.

bkit-doctor se inspiró en [bkit](https://github.com/popup-studio-ai/bkit-claude-code) — un flujo de trabajo de desarrollo nativo con IA basado en PDCA. El autor aprendió la colaboración estructurada con IA a través de los materiales de bkit, y ese conocimiento dio forma al diseño de esta herramienta.

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

Apache License 2.0 — consulta [LICENSE](./LICENSE) para los términos completos.

---

## Agradecimientos

- **[bkit](https://github.com/popup-studio-ai/bkit-claude-code)** — por la filosofía de flujo de trabajo que inspiró este proyecto
- La comunidad open-source — por las herramientas y patrones sobre los que se construye este proyecto

---

> **Aviso legal**: Esta es una herramienta comunitaria independiente, no un producto oficial de POPUP STUDIO. "bkit" es una marca registrada de POPUP STUDIO PTE. LTD.
