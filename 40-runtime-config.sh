#!/bin/sh
set -eu

api_url="${VITE_API_URL:-}"
escaped_api_url=$(printf '%s' "$api_url" | sed 's/\\/\\\\/g; s/"/\\"/g')
printf 'window.__APP_CONFIG__ = { API_URL: "%s" };\n' "$escaped_api_url" > /usr/share/nginx/html/config.js