#!/bin/sh
# Repository guard for Rebeldom.
# Usage:
#   sh .githooks/check-repo.sh --staged   # files staged for commit
#   sh .githooks/check-repo.sh --tree     # files tracked at HEAD (CI / pre-push)
#
# This is a safety net, not a replacement for GitHub secret scanning.
# It intentionally does not print matched secret values.

set -u

mode="${1:---tree}"
repo_root=$(git rev-parse --show-toplevel 2>/dev/null) || {
  echo "[repo-guard] 当前目录不是 Git 仓库。" >&2
  exit 1
}
cd "$repo_root" || exit 1

tmp_file="${TMPDIR:-/tmp}/rebeldom-repo-guard.$$"
: > "$tmp_file" || exit 1
trap 'rm -f "$tmp_file"' EXIT HUP INT TERM

if [ "$mode" = "--staged" ]; then
  git diff --cached --name-only --diff-filter=ACMR > "$tmp_file"
  scan_label="暂存区"
else
  git ls-files > "$tmp_file"
  scan_label="HEAD"
fi

if [ ! -s "$tmp_file" ]; then
  exit 0
fi

blocked_names='(^|/)(\.env[^/]*|\.DS_Store|Thumbs\.db|ehthumbs\.db|desktop\.ini|\.netrc|\.npmrc|\.pypirc|\.git-credentials|id_rsa|id_ed25519|credentials[^/]*\.json|secrets[^/]*\.json|node_modules|\.vscode|\.idea|\.edge-profile|\.playwright|\.cache|\.aws|\.ssh|_preview[^/]*|_screenshot[^/]*|_test-[^/]*|_tmp-[^/]*|.*\.(pem|key|p12|pfx|jks|keystore|kdbx|log|sqlite|sqlite3|db|dump|sql|bak|backup|swp|swo|tmp|temp|zip|7z|tar|gz|tgz))($|/)'
status=0

while IFS= read -r file; do
  [ -n "$file" ] || continue

  case "$file" in
    .env.example|*/.env.example)
      ;;
    *)
      if printf '%s\n' "$file" | grep -Eiq "$blocked_names"; then
        echo "[repo-guard] 阻止：不允许提交此文件：$file" >&2
        status=1
      fi
      ;;
  esac

  if [ "$mode" = "--staged" ]; then
    size=$(git cat-file -s ":$file" 2>/dev/null || echo 0)
  else
    size=$(git cat-file -s "HEAD:$file" 2>/dev/null || echo 0)
  fi

  case "$size" in
    ''|*[!0-9]*) size=0 ;;
  esac

  if [ "$size" -gt 10485760 ]; then
    echo "[repo-guard] 阻止：文件超过 10 MB，请确认后再加入：$file" >&2
    status=1
  fi

  # The guard script necessarily contains the token patterns themselves.
  if [ "$file" != ".githooks/check-repo.sh" ]; then
    secret_re='-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----|AKIA[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{50,}|xox[baprs]-[0-9A-Za-z-]{20,}|AIza[0-9A-Za-z_-]{35}|sk_live_[0-9A-Za-z]{20,}'
    if [ "$mode" = "--staged" ]; then
      if git show ":$file" 2>/dev/null | grep -IqE -- "$secret_re"; then
        echo "[repo-guard] 阻止：检测到疑似密钥或令牌：$file" >&2
        status=1
      fi
    else
      if git show "HEAD:$file" 2>/dev/null | grep -IqE -- "$secret_re"; then
        echo "[repo-guard] 阻止：检测到疑似密钥或令牌：$file" >&2
        status=1
      fi
    fi
  fi
done < "$tmp_file"

if [ "$status" -ne 0 ]; then
  cat >&2 <<'EOF'

提交/推送已被阻止。请从暂存区移除敏感或临时文件：
  git restore --staged <文件>
  rm <文件>
如果检测到的是真实密钥，请先立刻在对应平台撤销并轮换它。
如果需要检查所有已跟踪文件：
  sh .githooks/check-repo.sh --tree

不要使用 --no-verify 绕过此检查。
EOF
  exit 1
fi

echo "[repo-guard] 通过：$scan_label 中没有发现禁止的文件或常见密钥。"
exit 0
