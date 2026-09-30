#!/usr/bin/env bash
set -e

# Usage: NEXT_PUBLIC_API_BASE_URL=https://api.example.org bash build-image.sh [version]
# The API URL is baked into the client bundle, so it is required here.
VERSION=${1:-${VERSION:-1.0.0}}
IMAGE=frontend-ui
: "${NEXT_PUBLIC_API_BASE_URL:?Set NEXT_PUBLIC_API_BASE_URL to the API address for this image}"

echo "Building ${IMAGE}:${VERSION} for ${NEXT_PUBLIC_API_BASE_URL} (no cache)"
docker build --no-cache --target production \
  --build-arg NEXT_PUBLIC_API_BASE_URL="${NEXT_PUBLIC_API_BASE_URL}" \
  -t ${IMAGE}:${VERSION} .
