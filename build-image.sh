#!/usr/bin/env bash
set -e

VERSION=${1:-1.0.0}
IMAGE=frontend-ui

echo "Building ${IMAGE}:${VERSION} (no cache)"
docker build --no-cache -t ${IMAGE}:${VERSION} .
