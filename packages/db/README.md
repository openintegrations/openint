

```

cd apps/web/migrations
for f in *.sql; echo "--- filename: $f ---"; cat "$f"; echo ";"; echo; end > ../../../packages/db/migrations/0000_init.sql

cd ../../../packages/db
pnpm drizzle-kit generate --custom --name init --out ./migrations --dialect postgresql --schema ./schema.ts

DATABASE_URL=postgresql://postgres:password@127.0.0.1/postgres pnpm db:run-migrations
```

## Migrate data from one db to another


`SET CONSTRAINTS ALL DEFERRED` is used to work around circular foreign key issue betwen connection vs. connector_config

```
pg_dump $PREV_DB_URL --schema public --data-only --exclude-table=sync_run --exclude-table=sync_state --exclude-table=_migrations --column-inserts > temp/dump_2025-01-05.sql
begin; echo "BEGIN; SET CONSTRAINTS ALL DEFERRED;"; cat ./temp/dump_2025-01-05.sql ; echo "COMMIT; "; end | psql $NEXT_DB_URL
```
