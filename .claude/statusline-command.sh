#!/usr/bin/env bash
# bkit-doctor statusline
# Claude Code passes session JSON via stdin — field names vary by version
input=$(cat 2>/dev/null)

# --- 모델명 추출 (jq 있으면 사용, 없으면 건너뜀) ---
model=""
if command -v jq &>/dev/null; then
  model=$(printf '%s' "$input" | jq -r '
    .model.display_name //
    .model //
    .session.model //
    empty
  ' 2>/dev/null)

  # context_window 데이터 시도 (Claude Code 버전에 따라 제공될 수 있음)
  used_pct=$(printf '%s' "$input" | jq -r '
    .context_window.used_percentage //
    .context_window_usage.percent //
    empty
  ' 2>/dev/null)
fi

# --- 현재 phase 읽기 (파일 기반, 항상 신뢰 가능) ---
phase=""
status_file="$(cd "$(dirname "$0")/.." && pwd)/context/current-status.md"
if [ -f "$status_file" ]; then
  # "phase-03-init-doctor-mvp" 형태에서 숫자+이름 추출
  phase=$(grep -m1 '`phase-' "$status_file" | sed "s/.*\`phase-//;s/\`.*//")
fi

# --- git 브랜치 ---
branch=""
repo_root="$(cd "$(dirname "$0")/../.." && pwd)"
branch=$(git -C "$repo_root" rev-parse --abbrev-ref HEAD 2>/dev/null)

# --- 출력 조합 ---
parts=()

# 모델명
[ -n "$model" ] && parts+=("$model")

# context % (있을 때만)
if [ -n "$used_pct" ]; then
  pct_int=$(printf '%.0f' "$used_pct" 2>/dev/null || echo "0")
  if   [ "$pct_int" -ge 80 ]; then icon="🔴"
  elif [ "$pct_int" -ge 50 ]; then icon="🟡"
  else                              icon="🟢"
  fi
  parts+=("${icon} ctx ${pct_int}%")
fi

# 브랜치
[ -n "$branch" ] && parts+=("⎇ ${branch}")

# phase
[ -n "$phase" ] && parts+=("phase-${phase}")

# 아무것도 없으면 최소 표시
if [ ${#parts[@]} -eq 0 ]; then
  printf "bkit-doctor"
  exit 0
fi

# IFS 방식 대신 직접 join
out=""
for p in "${parts[@]}"; do
  [ -n "$out" ] && out="${out} │ "
  out="${out}${p}"
done
printf '%s' "$out"
