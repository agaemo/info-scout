#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")"

set -a
source .env
set +a

/Users/d.handa/.local/bin/claude -p "$(cat prompt.md)" --allowedTools Bash,WebSearch,WebFetch
