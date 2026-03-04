#!/usr/bin/env bash
set -euo pipefail

# GitHub account-wide repository audit utility.
# Requires: curl, jq
# Auth: set GITHUB_TOKEN (classic PAT or fine-grained token with repo read metadata access)

usage() {
  cat <<'USAGE'
Usage:
  scripts/github-audit.sh --owner <user-or-org> [--owner <user-or-org> ...] [--output-dir <dir>]

Options:
  --owner <value>      GitHub user or organization to audit. Repeatable.
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

if [[ ${#owners[@]} -eq 0 ]]; then
  echo "Error: provide at least one --owner" >&2
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

collect_owner_repos() {
  local owner="$1"
  local page=1
  local per_page=100
  local acc='[]'

  while true; do
    local url="https://api.github.com/users/${owner}/repos?type=all&sort=updated&per_page=${per_page}&page=${page}"
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

iso_days_ago() {
  local days="$1"
  date -u -d "-${days} days" +%Y-%m-%dT%H:%M:%SZ
}

mkdir -p "$OUTPUT_DIR"

for owner in "${owners[@]}"; do
  owner_dir="$OUTPUT_DIR/$owner"
  mkdir -p "$owner_dir"

  echo "[audit] Fetching repos for: $owner"
  repos_json="$(collect_owner_repos "$owner")"
  printf '%s\n' "$repos_json" > "$owner_dir/repos.json"

  total="$(jq 'length' "$owner_dir/repos.json")"
  archived="$(jq '[.[] | select(.archived == true)] | length' "$owner_dir/repos.json")"
  forks="$(jq '[.[] | select(.fork == true)] | length' "$owner_dir/repos.json")"
  private="$(jq '[.[] | select(.private == true)] | length' "$owner_dir/repos.json")"

  cutoff_180="$(iso_days_ago 180)"
  stale_180_count="$(jq --arg cutoff "$cutoff_180" '[.[] | select(.pushed_at < $cutoff)] | length' "$owner_dir/repos.json")"

  jq -r '.[] | select(.archived == true) | .full_name' "$owner_dir/repos.json" | sort > "$owner_dir/archived.txt"
  jq -r --arg cutoff "$cutoff_180" '.[] | select(.pushed_at < $cutoff) | "\(.full_name) | pushed_at=\(.pushed_at)"' "$owner_dir/repos.json" | sort > "$owner_dir/stale-180d.txt"

  # Heuristic: no default workflows path in repo metadata, so query each repo for workflows count.
  # This can be API-expensive but gives a direct CI presence signal.
  : > "$owner_dir/no-ci-workflow.txt"
  while IFS= read -r repo_full_name; do
    workflows_response="$(api_get "https://api.github.com/repos/${repo_full_name}/actions/workflows?per_page=1")"
    if jq -e '.message? // empty' >/dev/null <<<"$workflows_response"; then
      # ignore permission edge cases (e.g., disabled actions) as "unknown"
      continue
    fi
    workflows_count="$(jq -r '.total_count // 0' <<<"$workflows_response")"
    if [[ "$workflows_count" == "0" ]]; then
      echo "$repo_full_name" >> "$owner_dir/no-ci-workflow.txt"
    fi
  done < <(jq -r '.[].full_name' "$owner_dir/repos.json")

  no_ci_count="$(wc -l < "$owner_dir/no-ci-workflow.txt" | tr -d ' ')"

  cat > "$owner_dir/summary.md" <<SUMMARY
# GitHub Audit Summary: ${owner}

- Total repos: **${total}**
- Private repos: **${private}**
- Forks: **${forks}**
- Archived repos: **${archived}**
- Stale repos (>180 days sin push): **${stale_180_count}**
- Repos sin workflows de GitHub Actions: **${no_ci_count}**

## Files
- \\`repos.json\\`: dataset completo de repos
- \\`archived.txt\\`: repos archivados
- \\`stale-180d.txt\\`: repos desactualizados por push
- \\`no-ci-workflow.txt\\`: repos sin workflows de Actions

## Next actions sugeridas
1. Definir política de archivado o mantenimiento para \\`stale-180d.txt\\`.
2. Agregar CI mínimo a repos en \\`no-ci-workflow.txt\\`.
3. Revisar forks internos que ya no aportan valor.
SUMMARY

  echo "[audit] Done: $owner -> $owner_dir/summary.md"
done

echo "[audit] Completed. Output in: $OUTPUT_DIR"
