#!/usr/bin/env bash
set -euo pipefail

# GitHub account-wide repository audit utility.
# Requires: curl, jq
# Auth: set GITHUB_TOKEN (classic PAT or fine-grained token with repo read metadata access)

usage() {
  cat <<'USAGE'
Usage:
  scripts/github-audit.sh [--owner <user-or-org> ...] [--self] [--output-dir <dir>]

Options:
  --owner <value>      GitHub user or organization to audit. Repeatable.
  --self               Audit authenticated user repos via /user/repos (incluye privados accesibles).
  --output-dir <dir>   Directory where reports are written (default: ./audit-reports)
  -h, --help           Show this help message.

Environment:
  GITHUB_TOKEN         Required. GitHub token used for API requests.

Outputs per owner:
  <output-dir>/<owner>/repos.json
  <output-dir>/<owner>/summary.md
  <output-dir>/<owner>/archived.txt
  <output-dir>/<owner>/stale-180d.txt
  <output-dir>/<owner>/no-ci-workflow.txt
  <output-dir>/<owner>/workflow-check-unknown.txt
USAGE
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Error: missing required command '$1'" >&2
    exit 1
  }
}

require_cmd curl
require_cmd jq

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

if [[ -z "${GITHUB_TOKEN:-}" ]]; then
  echo "Error: GITHUB_TOKEN is required." >&2
  exit 1
fi

OUTPUT_DIR="audit-reports"
owners=()
audit_self="false"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --owner)
      if [[ $# -lt 2 ]]; then
        echo "Error: --owner requires a value" >&2
        exit 1
      fi
      owners+=("$2")
      shift 2
      ;;
    --self)
      audit_self="true"
      shift
      ;;
    --output-dir)
      if [[ $# -lt 2 ]]; then
        echo "Error: --output-dir requires a value" >&2
        exit 1
      fi
      OUTPUT_DIR="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Error: unknown argument '$1'" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ ${#owners[@]} -eq 0 && "$audit_self" != "true" ]]; then
  echo "Error: provide at least one --owner or use --self" >&2
  usage
  exit 1
fi

api_get() {
  local url="$1"
  curl -sS \
    -H "Accept: application/vnd.github+json" \
    -H "Authorization: Bearer $GITHUB_TOKEN" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    "$url"
}

api_get_status() {
  local url="$1"
  curl -sS -o /tmp/github-audit-response.json -w '%{http_code}' \
    -H "Accept: application/vnd.github+json" \
    -H "Authorization: Bearer $GITHUB_TOKEN" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    "$url"
}

get_owner_type() {
  local owner="$1"
  local payload
  payload="$(api_get "https://api.github.com/users/${owner}")"

  if jq -e '.message? // empty' >/dev/null <<<"$payload"; then
    local msg
    msg="$(jq -r '.message' <<<"$payload")"
    echo "Error resolving owner '${owner}': ${msg}" >&2
    return 1
  fi

  jq -r '.type' <<<"$payload"
}

collect_owner_repos() {
  local owner="$1"
  local owner_type="$2"
  local page=1
  local per_page=100
  local acc='[]'
  local endpoint

  if [[ "$owner_type" == "Organization" ]]; then
    endpoint="orgs/${owner}/repos?type=all"
  else
    endpoint="users/${owner}/repos?type=owner"
  fi

  while true; do
    local url="https://api.github.com/${endpoint}&sort=updated&per_page=${per_page}&page=${page}"
    local batch
    batch="$(api_get "$url")"

    if jq -e '.message? // empty' >/dev/null <<<"$batch"; then
      local msg
      msg="$(jq -r '.message' <<<"$batch")"
      echo "Error querying ${owner}: ${msg}" >&2
      return 1
    fi

    local count
    count="$(jq 'length' <<<"$batch")"
    if [[ "$count" -eq 0 ]]; then
      break
    fi

    acc="$(jq -c --argjson a "$acc" --argjson b "$batch" '$a + $b' <<<"null")"
    ((page++))
  done

  printf '%s\n' "$acc"
}

collect_authenticated_user_repos() {
  local page=1
  local per_page=100
  local acc='[]'

  while true; do
    local url="https://api.github.com/user/repos?affiliation=owner,collaborator,organization_member&sort=updated&per_page=${per_page}&page=${page}"
    local batch
    batch="$(api_get "$url")"

    if jq -e '.message? // empty' >/dev/null <<<"$batch"; then
      local msg
      msg="$(jq -r '.message' <<<"$batch")"
      echo "Error querying authenticated user repos: ${msg}" >&2
      return 1
    fi

    local count
    count="$(jq 'length' <<<"$batch")"
    if [[ "$count" -eq 0 ]]; then
      break
    fi

    acc="$(jq -c --argjson a "$acc" --argjson b "$batch" '$a + $b' <<<"null")"
    ((page++))
  done

  jq -c 'unique_by(.id)' <<<"$acc"
}

iso_days_ago() {
  local days="$1"
  date -u -d "-${days} days" +%Y-%m-%dT%H:%M:%SZ
}

write_owner_reports() {
  local owner="$1"
  local repos_json="$2"

  local owner_dir="$OUTPUT_DIR/$owner"
  mkdir -p "$owner_dir"

  printf '%s\n' "$repos_json" > "$owner_dir/repos.json"

  local total archived forks private cutoff_180 stale_180_count
  total="$(jq 'length' "$owner_dir/repos.json")"
  archived="$(jq '[.[] | select(.archived == true)] | length' "$owner_dir/repos.json")"
  forks="$(jq '[.[] | select(.fork == true)] | length' "$owner_dir/repos.json")"
  private="$(jq '[.[] | select(.private == true)] | length' "$owner_dir/repos.json")"

  cutoff_180="$(iso_days_ago 180)"
  stale_180_count="$(jq --arg cutoff "$cutoff_180" '[.[] | select(.pushed_at < $cutoff)] | length' "$owner_dir/repos.json")"

  jq -r '.[] | select(.archived == true) | .full_name' "$owner_dir/repos.json" | sort > "$owner_dir/archived.txt"
  jq -r --arg cutoff "$cutoff_180" '.[] | select(.pushed_at < $cutoff) | "\(.full_name) | pushed_at=\(.pushed_at)"' "$owner_dir/repos.json" | sort > "$owner_dir/stale-180d.txt"

  : > "$owner_dir/no-ci-workflow.txt"
  : > "$owner_dir/workflow-check-unknown.txt"

  while IFS= read -r repo_full_name; do
    local http_status workflows_response workflows_count
    http_status="$(api_get_status "https://api.github.com/repos/${repo_full_name}/actions/workflows?per_page=1")"
    workflows_response="$(cat /tmp/github-audit-response.json)"

    if [[ "$http_status" != "200" ]]; then
      echo "${repo_full_name} | http_status=${http_status}" >> "$owner_dir/workflow-check-unknown.txt"
      continue
    fi

    workflows_count="$(jq -r '.total_count // 0' <<<"$workflows_response")"
    if [[ "$workflows_count" == "0" ]]; then
      echo "$repo_full_name" >> "$owner_dir/no-ci-workflow.txt"
    fi
  done < <(jq -r '.[].full_name' "$owner_dir/repos.json")

  local no_ci_count unknown_workflow_count
  no_ci_count="$(wc -l < "$owner_dir/no-ci-workflow.txt" | tr -d ' ')"
  unknown_workflow_count="$(wc -l < "$owner_dir/workflow-check-unknown.txt" | tr -d ' ')"

  cat > "$owner_dir/summary.md" <<SUMMARY
# GitHub Audit Summary: ${owner}

- Total repos: **${total}**
- Private repos: **${private}**
- Forks: **${forks}**
- Archived repos: **${archived}**
- Stale repos (>180 days sin push): **${stale_180_count}**
- Repos sin workflows de GitHub Actions: **${no_ci_count}**
- Repos con estado de workflows no verificable: **${unknown_workflow_count}**

## Files
- \`repos.json\`: dataset completo de repos
- \`archived.txt\`: repos archivados
- \`stale-180d.txt\`: repos desactualizados por push
- \`no-ci-workflow.txt\`: repos sin workflows de Actions
- \`workflow-check-unknown.txt\`: repos donde no se pudo verificar workflows (por permisos/estado)

## Next actions sugeridas
1. Definir política de archivado o mantenimiento para \`stale-180d.txt\`.
2. Agregar CI mínimo a repos en \`no-ci-workflow.txt\`.
3. Revisar repos en \`workflow-check-unknown.txt\` para corregir permisos o estado de Actions.
4. Revisar forks internos que ya no aportan valor.
SUMMARY

  echo "[audit] Done: $owner -> $owner_dir/summary.md"
}

mkdir -p "$OUTPUT_DIR"

if [[ "$audit_self" == "true" ]]; then
  echo "[audit] Fetching repos for authenticated user (--self)"
  self_login="$(api_get "https://api.github.com/user" | jq -r '.login // "authenticated-user"')"
  self_repos="$(collect_authenticated_user_repos)"
  write_owner_reports "$self_login" "$self_repos"
fi

for owner in "${owners[@]}"; do
  echo "[audit] Fetching repos for: $owner"
  owner_type="$(get_owner_type "$owner")"
  repos_json="$(collect_owner_repos "$owner" "$owner_type")"
  write_owner_reports "$owner" "$repos_json"
done

echo "[audit] Completed. Output in: $OUTPUT_DIR"
