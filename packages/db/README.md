

```

cd apps/web/migrations
for f in *.sql; echo "--- filename: $f ---"; cat "$f"; echo ";"; echo; end > ../../../packages/db/migrations/0000_init.sql

cd ../../../packages/db
pnpm drizzle-kit generate --custom --name init --out ./migrations --dialect postgresql --schema ./schema.ts

DATABASE_URL=postgresql://postgres:password@127.0.0.1/postgres pnpm db:run-migrations
```
