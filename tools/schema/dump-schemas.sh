#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
ROOT=$(cd "$SCRIPT_DIR/../.." && pwd)

# shellcheck source=tools/schema/lib.sh
source "$SCRIPT_DIR/lib.sh"

usage() {
    cat <<'USAGE'
Usage: tools/schema/dump-schemas.sh [options]

Options:
  --out PATH                 Output directory for schema files (default: ./schemas)
  --dbs LIST                 Comma-separated list: sqlite,postgres,mysql,mariadb
  --db-name NAME             Database name (default: flowise)
  --runner host|container    Where to run migrations (default: container)
  --runtime podman|docker    Force container runtime
  --devcontainer-image NAME  Devcontainer image name (default: flowise-devcontainer)
  --build-devcontainer       Build devcontainer image if missing (default: auto)
  --no-build-devcontainer    Do not build devcontainer image if missing
  -h, --help                 Show this help

Environment overrides:
  OUT_DIR, DBS, DB_NAME, RUNNER, RUNTIME,
  DEVCONTAINER_IMAGE, DEVCONTAINER_DOCKERFILE, BUILD_DEVCONTAINER

Examples:
  tools/schema/dump-schemas.sh
  tools/schema/dump-schemas.sh --dbs sqlite,postgres --out ./schemas
  tools/schema/dump-schemas.sh --runner host
USAGE
}

OUT_DIR="${OUT_DIR:-$ROOT/schemas}"
DBS="${DBS:-sqlite,postgres,mysql,mariadb}"
DB_NAME="${DB_NAME:-flowise}"
RUNNER="${RUNNER:-container}"
RUNTIME="${RUNTIME:-}"
DEVCONTAINER_IMAGE="${DEVCONTAINER_IMAGE:-flowise-devcontainer}"
DEVCONTAINER_DOCKERFILE="${DEVCONTAINER_DOCKERFILE:-$ROOT/.devcontainer/Dockerfile}"
BUILD_DEVCONTAINER="${BUILD_DEVCONTAINER:-auto}"

while [[ $# -gt 0 ]]; do
    case "$1" in
        --out)
            OUT_DIR="$2"
            shift 2
            ;;
        --dbs)
            DBS="$2"
            shift 2
            ;;
        --db-name)
            DB_NAME="$2"
            shift 2
            ;;
        --runner)
            RUNNER="$2"
            shift 2
            ;;
        --runtime)
            RUNTIME="$2"
            shift 2
            ;;
        --devcontainer-image)
            DEVCONTAINER_IMAGE="$2"
            shift 2
            ;;
        --build-devcontainer)
            BUILD_DEVCONTAINER="true"
            shift
            ;;
        --no-build-devcontainer)
            BUILD_DEVCONTAINER="false"
            shift
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            die "Unknown argument: $1"
            ;;
    esac
done

DBS_LIST=$(echo "$DBS" | tr ',' ' ')
NEEDS_RUNTIME=false
for db in $DBS_LIST; do
    db=$(echo "$db" | tr '[:upper:]' '[:lower:]')
    if [[ "$db" != "sqlite" ]]; then
        NEEDS_RUNTIME=true
        break
    fi
done

if [[ -z "$RUNTIME" ]]; then
    if runtime=$(detect_runtime); then
        RUNTIME="$runtime"
    else
        RUNTIME=""
    fi
fi

if [[ "$RUNNER" == "container" && -z "$RUNTIME" ]]; then
    warn "podman/docker not found; falling back to host runner"
    RUNNER="host"
fi

if [[ "$NEEDS_RUNTIME" == "true" && -z "$RUNTIME" ]]; then
    die "podman/docker is required for postgres/mysql/mariadb schema dumps."
fi

if [[ "$RUNNER" == "host" ]] && ! command_exists pnpm; then
    die "pnpm not found. Install pnpm or use --runner container."
fi

ensure_devcontainer_image() {
    if runtime_image_exists "$RUNTIME" "$DEVCONTAINER_IMAGE"; then
        return 0
    fi

    if [[ "$BUILD_DEVCONTAINER" == "false" ]]; then
        die "Devcontainer image '$DEVCONTAINER_IMAGE' not found and build disabled."
    fi

    if [[ ! -f "$DEVCONTAINER_DOCKERFILE" ]]; then
        die "Devcontainer Dockerfile not found at $DEVCONTAINER_DOCKERFILE"
    fi

    log "Building devcontainer image: $DEVCONTAINER_IMAGE"
    "$RUNTIME" build -f "$DEVCONTAINER_DOCKERFILE" -t "$DEVCONTAINER_IMAGE" "$ROOT"
}

NETWORK_NAME=""
CONTAINERS=()
SQLITE_DIR=""

cleanup() {
    set +e
    for container in "${CONTAINERS[@]:-}"; do
        "$RUNTIME" rm -f "$container" >/dev/null 2>&1 || true
    done
    if [[ -n "${NETWORK_NAME:-}" ]]; then
        "$RUNTIME" network rm "$NETWORK_NAME" >/dev/null 2>&1 || true
    fi
    if [[ -n "${SQLITE_DIR:-}" && -d "$SQLITE_DIR" ]]; then
        rm -rf "$SQLITE_DIR" || true
    fi
}
trap cleanup EXIT

if [[ "$RUNNER" == "container" ]]; then
    ensure_devcontainer_image
    NETWORK_NAME="flowise-schema-net-$$"
    "$RUNTIME" network create "$NETWORK_NAME" >/dev/null
fi

mkdir -p "$OUT_DIR"

run_migrations() {
    local -a envs=("$@")
    if [[ "$RUNNER" == "container" ]]; then
        local -a env_args=()
        local kv
        for kv in "${envs[@]}"; do
            env_args+=("-e" "$kv")
        done
        "$RUNTIME" run --rm \
            --network "$NETWORK_NAME" \
            -v "$ROOT":/workspace \
            -w /workspace \
            "${env_args[@]}" \
            "$DEVCONTAINER_IMAGE" \
            pnpm -C packages/server typeorm:migration-run
    else
        (cd "$ROOT" && env "${envs[@]}" pnpm -C packages/server typeorm:migration-run)
    fi
}

wait_for_mysql() {
    local container="$1"
    local user="$2"
    local password="$3"
    local db="$4"
    local tries=30
    while (( tries > 0 )); do
        if "$RUNTIME" exec -e MYSQL_PWD="$password" "$container" \
            mysqladmin ping -h 127.0.0.1 -u "$user" --silent >/dev/null 2>&1; then
            "$RUNTIME" exec -e MYSQL_PWD="$password" "$container" \
                mysql -h 127.0.0.1 -u "$user" -e "SELECT 1" "$db" >/dev/null 2>&1 && return 0
        fi
        sleep 2
        tries=$((tries - 1))
    done
    return 1
}

wait_for_postgres() {
    local container="$1"
    local user="$2"
    local db="$3"
    local password="$4"
    local tries=30
    while (( tries > 0 )); do
        if "$RUNTIME" exec -e PGPASSWORD="$password" "$container" pg_isready -U "$user" -d "$db" >/dev/null 2>&1; then
            return 0
        fi
        sleep 2
        tries=$((tries - 1))
    done
    return 1
}

start_mysql_container() {
    local image="$1"
    local name="$2"
    local root_password="$3"
    local db="$4"
    if [[ "$RUNNER" == "container" ]]; then
        "$RUNTIME" run -d --rm \
            --name "$name" \
            --network "$NETWORK_NAME" \
            -e MYSQL_ROOT_PASSWORD="$root_password" \
            -e MYSQL_DATABASE="$db" \
            "$image" >/dev/null
    else
        "$RUNTIME" run -d --rm \
            --name "$name" \
            -P \
            -e MYSQL_ROOT_PASSWORD="$root_password" \
            -e MYSQL_DATABASE="$db" \
            "$image" >/dev/null
    fi
    CONTAINERS+=("$name")
}

start_postgres_container() {
    local image="$1"
    local name="$2"
    local user="$3"
    local password="$4"
    local db="$5"
    if [[ "$RUNNER" == "container" ]]; then
        "$RUNTIME" run -d --rm \
            --name "$name" \
            --network "$NETWORK_NAME" \
            -e POSTGRES_USER="$user" \
            -e POSTGRES_PASSWORD="$password" \
            -e POSTGRES_DB="$db" \
            "$image" >/dev/null
    else
        "$RUNTIME" run -d --rm \
            --name "$name" \
            -P \
            -e POSTGRES_USER="$user" \
            -e POSTGRES_PASSWORD="$password" \
            -e POSTGRES_DB="$db" \
            "$image" >/dev/null
    fi
    CONTAINERS+=("$name")
}

get_host_port() {
    local container="$1"
    local port="$2"
    local mapping
    mapping=$("$RUNTIME" port "$container" "$port/tcp")
    echo "$mapping" | awk -F: '{print $NF}'
}

run_sqlite() {
    log "Running sqlite migrations"
    mkdir -p "$ROOT/tmp"
    SQLITE_DIR=$(mktemp -d "$ROOT/tmp/schema-sqlite-XXXX")
    local sqlite_path="$SQLITE_DIR"
    if [[ "$RUNNER" == "container" ]]; then
        sqlite_path="/workspace${SQLITE_DIR#$ROOT}"
    fi
    run_migrations \
        "DATABASE_TYPE=sqlite" \
        "DATABASE_PATH=$sqlite_path"

    local sqlite_db="$SQLITE_DIR/database.sqlite"
    local out_file="$OUT_DIR/sqlite.sql"

    if command_exists sqlite3; then
        sqlite3 "$sqlite_db" .schema > "$out_file"
    else
        if [[ -z "$RUNTIME" ]]; then
            die "sqlite3 not found and no container runtime available."
        fi
        ensure_devcontainer_image
        "$RUNTIME" run --rm \
            -v "$SQLITE_DIR":/sqlite \
            -w /sqlite \
            "$DEVCONTAINER_IMAGE" \
            sqlite3 /sqlite/database.sqlite .schema > "$out_file"
    fi

    log "Wrote $out_file"
}

run_postgres() {
    local image="${POSTGRES_IMAGE:-postgres:16}"
    local user="${POSTGRES_USER:-flowise}"
    local password="${POSTGRES_PASSWORD:-flowise}"
    local db="$DB_NAME"
    local name="flowise-schema-postgres-$$"

    log "Starting postgres container"
    start_postgres_container "$image" "$name" "$user" "$password" "$db"

    if ! wait_for_postgres "$name" "$user" "$db" "$password"; then
        die "Postgres did not become ready"
    fi

    if [[ "$RUNNER" == "container" ]]; then
        run_migrations \
            "DATABASE_TYPE=postgres" \
            "DATABASE_HOST=$name" \
            "DATABASE_PORT=5432" \
            "DATABASE_USER=$user" \
            "DATABASE_PASSWORD=$password" \
            "DATABASE_NAME=$db"
    else
        local host_port
        host_port=$(get_host_port "$name" 5432)
        run_migrations \
            "DATABASE_TYPE=postgres" \
            "DATABASE_HOST=127.0.0.1" \
            "DATABASE_PORT=$host_port" \
            "DATABASE_USER=$user" \
            "DATABASE_PASSWORD=$password" \
            "DATABASE_NAME=$db"
    fi

    local out_file="$OUT_DIR/postgres.sql"
    "$RUNTIME" exec -e PGPASSWORD="$password" "$name" \
        pg_dump --schema-only --create --no-owner --no-privileges -U "$user" "$db" > "$out_file"
    log "Wrote $out_file"
}

run_mysql() {
    local image="${MYSQL_IMAGE:-mysql:8.0}"
    local root_password="${MYSQL_ROOT_PASSWORD:-flowise}"
    local db="$DB_NAME"
    local name="flowise-schema-mysql-$$"

    log "Starting mysql container"
    start_mysql_container "$image" "$name" "$root_password" "$db"

    if ! wait_for_mysql "$name" "root" "$root_password" "$db"; then
        die "MySQL did not become ready"
    fi

    if [[ "$RUNNER" == "container" ]]; then
        run_migrations \
            "DATABASE_TYPE=mysql" \
            "DATABASE_HOST=$name" \
            "DATABASE_PORT=3306" \
            "DATABASE_USER=root" \
            "DATABASE_PASSWORD=$root_password" \
            "DATABASE_NAME=$db"
    else
        local host_port
        host_port=$(get_host_port "$name" 3306)
        run_migrations \
            "DATABASE_TYPE=mysql" \
            "DATABASE_HOST=127.0.0.1" \
            "DATABASE_PORT=$host_port" \
            "DATABASE_USER=root" \
            "DATABASE_PASSWORD=$root_password" \
            "DATABASE_NAME=$db"
    fi

    local out_file="$OUT_DIR/mysql.sql"
    "$RUNTIME" exec -e MYSQL_PWD="$root_password" "$name" \
        mysqldump --no-data --databases "$db" -u root --skip-comments > "$out_file"
    log "Wrote $out_file"
}

run_mariadb() {
    local image="${MARIADB_IMAGE:-mariadb:11}"
    local root_password="${MARIADB_ROOT_PASSWORD:-flowise}"
    local db="$DB_NAME"
    local name="flowise-schema-mariadb-$$"

    log "Starting mariadb container"
    start_mysql_container "$image" "$name" "$root_password" "$db"

    if ! wait_for_mysql "$name" "root" "$root_password" "$db"; then
        die "MariaDB did not become ready"
    fi

    if [[ "$RUNNER" == "container" ]]; then
        run_migrations \
            "DATABASE_TYPE=mariadb" \
            "DATABASE_HOST=$name" \
            "DATABASE_PORT=3306" \
            "DATABASE_USER=root" \
            "DATABASE_PASSWORD=$root_password" \
            "DATABASE_NAME=$db"
    else
        local host_port
        host_port=$(get_host_port "$name" 3306)
        run_migrations \
            "DATABASE_TYPE=mariadb" \
            "DATABASE_HOST=127.0.0.1" \
            "DATABASE_PORT=$host_port" \
            "DATABASE_USER=root" \
            "DATABASE_PASSWORD=$root_password" \
            "DATABASE_NAME=$db"
    fi

    local out_file="$OUT_DIR/mariadb.sql"
    "$RUNTIME" exec -e MYSQL_PWD="$root_password" "$name" \
        mysqldump --no-data --databases "$db" -u root --skip-comments > "$out_file"
    log "Wrote $out_file"
}

for db in $DBS_LIST; do
    db=$(echo "$db" | tr '[:upper:]' '[:lower:]')
    case "$db" in
        sqlite)
            run_sqlite
            ;;
        postgres)
            run_postgres
            ;;
        mysql)
            run_mysql
            ;;
        mariadb)
            run_mariadb
            ;;
        *)
            die "Unsupported db: $db"
            ;;
    esac
done

log "Schema dump complete"
