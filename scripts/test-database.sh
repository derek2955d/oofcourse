#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
container="oofcourse-rls-$$"
trap 'docker rm -f "$container" >/dev/null 2>&1 || true' EXIT
# Isolated disposable database; no network or published ports. No production credentials.
docker run --name "$container" --network none -e POSTGRES_HOST_AUTH_METHOD=trust -d postgres:17-alpine >/dev/null
for attempt in {1..30}; do
 if docker exec "$container" pg_isready -U postgres >/dev/null 2>&1; then break; fi
 sleep 1
done
docker exec "$container" pg_isready -U postgres
docker exec -i "$container" psql -U postgres -v ON_ERROR_STOP=1 < tests/database/auth-fixture.sql
docker exec -i "$container" psql -U postgres -v ON_ERROR_STOP=1 < supabase/migrations/202610210001_initial_schema.sql
docker exec -i "$container" psql -U postgres -v ON_ERROR_STOP=1 < tests/database/rls.sql
