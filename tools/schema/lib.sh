#!/usr/bin/env bash
set -euo pipefail

log() {
    echo "[schema] $*" >&2
}

warn() {
    echo "[schema][warn] $*" >&2
}

die() {
    echo "[schema][error] $*" >&2
    exit 1
}

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

detect_runtime() {
    if command_exists podman; then
        echo "podman"
        return 0
    fi
    if command_exists docker; then
        echo "docker"
        return 0
    fi
    return 1
}

runtime_image_exists() {
    local runtime="$1"
    local image="$2"
    "$runtime" image inspect "$image" >/dev/null 2>&1
}
