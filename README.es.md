<div align="center">

# 🩺 bkit-doctor

**El CLI de flujo de trabajo AI para Claude Code.**
Configura tu proyecto una vez. Deja que Claude Code se encargue del resto — automáticamente, de forma consistente, cada vez.

[![npm version](https://img.shields.io/badge/npm-v1.1.1-blue)](https://www.npmjs.com/package/bkit-doctor)
[![license](https://img.shields.io/npm/l/bkit-doctor)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/dotoricode/bkit-doctor/pulls)

[English](README.md) · [한국어](README.ko.md) · [日本語](README.ja.md) · [中文](README.zh.md) · **Español**

</div>

---

## ¿Por qué bkit-doctor?

Cuando construyes proyectos con Claude Code, dos problemas aparecen en pocos días:

1. **Deriva estructural** — Los directorios `.claude/` desaparecen, las reglas de `CLAUDE.md` se dessincronizan, los hooks se pierden.
2. **Amnesia de flujo de trabajo** — Claude Code olvida documentar lo que construyó. Sin plan, sin rastro, sin auditoría.

**bkit-doctor resuelve ambos.** Impone la estructura del proyecto *y* conecta Claude Code para que siga un flujo de trabajo PDCA (Plan-Do-Check-Act) automáticamente — sin que tengas que pedirlo cada vez.

```
Claude Code genera la lógica.
bkit-doctor garantiza que la estructura y el estado del flujo de trabajo se rastreen permanentemente.
```

---

## 🚀 Inicio rápido

La forma más rápida de configurar un proyecto nuevo o existente:

```bash
npx bkit-doctor setup
```

Este único comando ejecuta un asistente interactivo:

```
bkit-doctor setup

  [1/4] Diagnosticando estructura del proyecto...
        ✔ Directorio .claude/ encontrado
        ✔ CLAUDE.md encontrado
        ⚠ hooks.json no encontrado → se corregirá

  [2/4] Corrigiendo automáticamente 3 problemas...
        ✔ hooks.json creado
        ✔ settings.local.json creado
        ✔ docs/ scaffoldeado

  [3/4] Generando CLAUDE.md...
        ✔ CLAUDE.md escrito (copia de seguridad: CLAUDE_20260330_backup.md)

  [4/4] Generando SKILL.md + scripts npm...
        ✔ SKILL.md creado
        ✔ Añadido a package.json: bkit:check, bkit:fix, bkit:setup

  Configuración completa. Claude Code seguirá flujos de trabajo PDCA automáticamente.
```

Después de la configuración, usa los atajos npm en lugar de `npx bkit-doctor ...`:

```bash
npm run bkit:check   # → bkit-doctor check
npm run bkit:fix     # → bkit-doctor fix --yes
npm run bkit:setup   # → bkit-doctor setup
```

---

## ✨ Características principales

### 🧙 `setup` — Inicialización de proyecto con un solo comando

```bash
bkit-doctor setup [--path <dir>]
```

Ejecuta cuatro pasos en secuencia: **Diagnosticar → Corregir → Generar CLAUDE.md → Generar SKILL.md + scripts npm**

- Hace copia de seguridad del `CLAUDE.md` existente como `CLAUDE_{date}_backup.md` antes de sobrescribir
- Seguro en CI/CD: entornos no-TTY omiten los prompts interactivos (mantiene archivos existentes)
- Idempotente: ejecutarlo dos veces es seguro

---

### 🤖 `skill` — Documentación PDCA sin prompts

```bash
bkit-doctor skill [--append-claude] [--overwrite] [--stdout] [--dry-run]
```

Genera un archivo `SKILL.md` que **programa a Claude Code** para documentar cada tarea automáticamente — sin necesidad de prompts.

```markdown
## RULE 1: PROACTIVE DOCUMENTATION
Antes de escribir código, ejecutar automáticamente:
  npx bkit-doctor pdca-plan "<topic>" --type <feature|bugfix|refactor|guideline>

## RULE 2: STATE SYNC
Antes de escribir código, verificar el estado PDCA existente:
  npx bkit-doctor pdca-list

## RULE 3: PIPELINE
Después de codificar, ejecutar automáticamente las etapas restantes:
  npx bkit-doctor pdca-do "<topic>"
  npx bkit-doctor pdca-check "<topic>"
  npx bkit-doctor pdca-report "<topic>"
```

**`--append-claude`** inyecta estas reglas directamente en tu `CLAUDE.md` para que se apliquen en todo el proyecto.

---

### 📋 `pdca` — Motor de flujo de trabajo AI basado en archivos

Genera documentos PDCA estructurados para cualquier tarea. El estado se rastrea en `.bkit-doctor/pdca-state.json`.

```bash
# Todo en uno: genera una guía completa
bkit-doctor pdca "Autenticación de usuarios" --type feature --owner alice --priority P1

# Flujo de trabajo por etapas
bkit-doctor pdca-plan "Autenticación de usuarios"
bkit-doctor pdca-do   "Autenticación de usuarios"
bkit-doctor pdca-check "Autenticación de usuarios"
bkit-doctor pdca-report "Autenticación de usuarios"

# Ver todos los temas activos
bkit-doctor pdca-list
```

Tipos de documento: `guideline` · `feature` · `bugfix` · `refactor`

Salida: `output/pdca/<slug>-pdca-{stage}.md` — versionable, auditable, rastreable con git.

---

### 🧹 `clear` — Limpieza segura de configuración

```bash
bkit-doctor clear [--path <dir>]
```

Selecciona y elimina interactivamente los archivos generados por bkit-doctor. Requiere confirmación explícita antes de eliminar — sin pérdida silenciosa de datos.

---

### 🔍 `check` / `fix` / `init` — Aplicación de estructura

```bash
bkit-doctor check        # Ejecuta 16 comprobaciones de diagnóstico → pass/warn/fail
bkit-doctor fix --yes    # Corrige todo automáticamente (check + recommend + init)
bkit-doctor init --preset default --yes   # Scaffoldea la estructura completa del proyecto
```

**16 comprobaciones de diagnóstico** en: estructura · configuración · agentes · habilidades · políticas · plantillas · documentación · changelog

Código de salida `1` en fallos graves (`.claude/` o `CLAUDE.md` ausentes) — compatible con CI.

---

## 🤖 Cómo funciona la integración con Claude Code

Cuando `SKILL.md` existe en la raíz de tu proyecto, Claude Code lo lee como contexto del proyecto y sigue sus reglas en cada tarea.

```
your-project/
├── CLAUDE.md          ← reglas del proyecto + directivas de flujo de trabajo
├── SKILL.md           ← reglas de automatización para Claude Code
├── .claude/
│   ├── hooks.json
│   └── settings.local.json
└── output/
    └── pdca/
        ├── user-auth-pdca-plan.md
        ├── user-auth-pdca-do.md
        └── user-auth-pdca-report.md     ← generado automáticamente, sin prompts
```

El resultado: **cada funcionalidad, corrección de bugs y refactorización es planificada, ejecutada, verificada e informada automáticamente** — construyendo una auditoría permanente sin sobrecarga manual.

---

## 📖 Referencia de comandos

| Comando | Descripción |
|---------|-------------|
| `setup` | Asistente interactivo: check → fix → CLAUDE.md → SKILL.md → scripts npm |
| `skill` | Genera `SKILL.md` con reglas de automatización para Claude Code |
| `clear` | Elimina interactivamente archivos de configuración con confirmación |
| `check` | Ejecuta 16 comprobaciones de diagnóstico |
| `fix` | Corrige todos los problemas automáticamente (check + recommend + init) |
| `init` | Scaffoldea archivos y directorios que faltan |
| `pdca <topic>` | Genera un documento guía PDCA completo |
| `pdca-plan <topic>` | Genera documento de etapa Plan |
| `pdca-do <topic>` | Genera documento de etapa Do |
| `pdca-check <topic>` | Genera documento de etapa Check |
| `pdca-report <topic>` | Genera documento de etapa Report |
| `pdca-list` | Lista todos los temas PDCA activos |
| `preset` | Lista, muestra o recomienda presets |
| `save` | Guarda la configuración actual (local / global / both) |
| `load` | Aplica la configuración guardada al proyecto actual |
| `version` | Muestra información de versión y plataforma |

---

## 📦 Qué se comprueba (16 elementos)

| Categoría | Comprobación | Severidad |
|-----------|-------------|-----------|
| structure | Directorio `.claude/` | **hard** (exit 1) |
| config | `CLAUDE.md` | **hard** (exit 1) |
| config | `hooks.json` | soft |
| config | `settings.local.json` | soft |
| agents | 4 archivos de definición de agentes | soft |
| skills | 7 archivos de habilidades en `.claude/skills/` | soft |
| policies | 4 archivos de políticas | soft |
| templates | 4 archivos de plantillas | soft |
| docs | `docs/01-plan/` → `docs/04-report/` (4 comprobaciones) | soft |
| docs | Directorio `output/pdca/` | soft |
| docs | Validez del contenido de la guía PDCA | soft |
| context | Directorio `.claude/context/` | soft |
| changelog | `CHANGELOG.md` | soft |

---

## 🛠 Objetivos `init` disponibles

| Objetivo | Crea |
|----------|------|
| `claude-root` | Directorio `.claude/` |
| `hooks-json` | `.claude/hooks.json` |
| `settings-local` | `.claude/settings.local.json` |
| `agents-core` | 4 archivos de definición de agentes |
| `skills-core` | 7 archivos SKILL.md en `.claude/skills/` |
| `templates-core` | 4 plantillas de documentos |
| `policies-core` | 4 archivos de políticas |
| `docs-core` | Todos los directorios `docs/` |
| `docs-pdca` | Directorio de salida PDCA `output/pdca/` |
| `docs-changelog` | `CHANGELOG.md` |

**Presets:** `default` (completo) · `lean` (mínimo) · `workflow-core` · `docs`

---

## 🔗 Funciona mejor con bkit

bkit-doctor impone estructura y estado. **[bkit](https://github.com/popup-studio-ai/bkit-claude-code)** es el plugin de Claude Code que impulsa el motor de flujo de trabajo AI en sí (31 agentes, 36 habilidades, orquestación PDCA).

| | bkit-doctor | bkit (plugin) |
|--|-------------|---------------|
| Estructura del proyecto | ✅ crea y valida | — |
| CLAUDE.md / SKILL.md | ✅ genera | lee |
| Motor de documentos PDCA | ✅ generación de archivos | orquestación |
| Agentes AI y habilidades | — | ✅ 31 agentes / 36 habilidades |
| Se ejecuta en | terminal | Claude Code |

```bash
# Instala bkit dentro de Claude Code
/plugin marketplace add popup-studio-ai/bkit-claude-code
```

---

## Uso en CI

```yaml
# GitHub Actions
- name: Comprobar estructura del proyecto
  run: npx bkit-doctor check
# Sale con 1 si .claude/ o CLAUDE.md faltan
```

---

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue primero para discutir lo que te gustaría cambiar.

1. Haz fork del repositorio
2. Crea una rama de funcionalidad: `git checkout -b feat/my-feature`
3. Ejecuta los tests: `npm test`
4. Envía un pull request

---

<div align="center">
  Hecho para desarrolladores que construyen con Claude Code.<br>
  <a href="https://github.com/dotoricode/bkit-doctor">GitHub</a> · <a href="https://www.npmjs.com/package/bkit-doctor">npm</a> · <a href="CHANGELOG.md">Changelog</a>
</div>
