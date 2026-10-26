#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
container="oofcourse-v2-rls-$$"
trap 'docker rm -f "$container" >/dev/null 2>&1 || true' EXIT
docker run --name "$container" --network none -e POSTGRES_HOST_AUTH_METHOD=trust -d postgres:17-alpine >/dev/null
for attempt in {1..30}; do
 if docker exec "$container" sh -c '[ "$(cat /proc/1/comm)" = postgres ] && pg_isready -U postgres' >/dev/null 2>&1; then break; fi
 sleep 1
done
if ! docker exec "$container" sh -c '[ "$(cat /proc/1/comm)" = postgres ] && pg_isready -U postgres' >/dev/null 2>&1; then
 docker logs "$container"
 exit 1
fi
docker exec -i "$container" psql -U postgres -v ON_ERROR_STOP=1 < tests/database/fixture.sql
for migration in supabase/migrations/*.sql; do
 docker exec -i "$container" psql -U postgres -v ON_ERROR_STOP=1 < "$migration"
done
docker exec -i "$container" psql -U postgres -v ON_ERROR_STOP=1 < tests/database/rls.sql
docker exec -i "$container" psql -U postgres -v ON_ERROR_STOP=1 < tests/database/workflows.sql
docker exec -i "$container" psql -U postgres -v ON_ERROR_STOP=1 < tests/database/geography.sql
docker exec -i "$container" psql -U postgres -v ON_ERROR_STOP=1 < tests/database/living.sql
docker exec -i "$container" psql -U postgres -v ON_ERROR_STOP=1 < tests/database/region-groups.sql
