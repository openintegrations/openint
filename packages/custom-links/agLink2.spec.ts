import {sql} from 'drizzle-orm'
import {drizzle} from 'drizzle-orm/postgres-js'
import type {CustomerId, Id} from '@openint/cdk'
import type {DeprecatedInputEntity} from '@openint/connector-postgres'
import {postgresServer} from '@openint/connector-postgres'
import {env} from '@openint/env'
import {rxjs, toCompletion} from '@openint/util'
import {agLink2} from './agLink2'

// console.log('filename', __filename)
const dbName = 'aglink2'

// TODO: Add me back in once we know CI is working
beforeAll(async () => {
  const masterDb = drizzle(env.DATABASE_URL, {logger: true})
  await masterDb.execute(`DROP DATABASE IF EXISTS ${dbName}`)
  await masterDb.execute(`CREATE DATABASE ${dbName}`)
  await masterDb.$client.end()
})

const dbUrl = new URL(env.DATABASE_URL)
dbUrl.pathname = `/${dbName}`
const db = drizzle(dbUrl.toString(), {logger: true})

const destLink = postgresServer.destinationSync({
  config: {},
  customer: {id: 'esur_12' as CustomerId, orgId: 'org_123'},
  settings: {databaseUrl: dbUrl.toString()},
  source: {id: 'conn_sfdc_9287', connectorName: 'sfdc'},
  state: {},
})

async function setupAgFixtures() {
  await db.execute(sql`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE TABLE "public"."client" (
        "id" uuid NOT NULL,
        "slug" varchar NOT NULL,
        "createdAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" timestamp,
        "legalName" text NOT NULL,
        "clerkCreatedAt" timestamp NOT NULL,
        "clerkCreatedBy" text NOT NULL,
        "clerkOrgId" text NOT NULL,
        PRIMARY KEY ("id")
    );
    CREATE SEQUENCE IF NOT EXISTS "sourceConnection_clientSortIdx_seq";
    DROP TYPE IF EXISTS "public"."IntegrationProfile";
    CREATE TYPE "public"."IntegrationProfile" AS ENUM ('Hris', 'Ats', 'Cap', 'Performance', 'PayrollHistory', 'Position', 'ATSJob');
    DROP TYPE IF EXISTS "public"."IntegrationSource";
    CREATE TYPE "public"."IntegrationSource" AS ENUM ( 'Merge',  'OpenInt');

    CREATE TABLE "public"."sourceConnection" (
        "id" text NOT NULL,
        "createdAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "clientId" uuid NOT NULL,
        "provider" text NOT NULL,
        "label" text NOT NULL,
        "profile" "public"."IntegrationProfile" NOT NULL,
        "source" "public"."IntegrationSource" NOT NULL,
        "deletedAt" timestamp,
        "clientSortIdx" int4 NOT NULL DEFAULT nextval('"sourceConnection_clientSortIdx_seq"'::regclass),
        CONSTRAINT "sourceConnection_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."client"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        PRIMARY KEY ("id")
    );
    CREATE TABLE IF NOT EXISTS "syncedData" (
      id                  uuid        PRIMARY KEY DEFAULT uuid_generate_v4(), -- "agUUID"(),
      "sourceConnectionId" text        NOT NULL REFERENCES "sourceConnection"(id) ON DELETE CASCADE ON UPDATE CASCADE,
      "sourceId"          text,
      "clientId"          uuid        NOT NULL REFERENCES client(id) ON DELETE CASCADE ON UPDATE CASCADE,
      "rawData"           jsonb       NOT NULL,
      "createdAt"         timestamp   DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "deletedAt"         timestamp   NULL,
      UNIQUE ("sourceConnectionId", "sourceId")
    );
  `)
  await db.execute(sql`
    INSERT INTO "public"."client" ("id", "slug", "createdAt", "updatedAt", "deletedAt", "legalName", "clerkCreatedAt", "clerkCreatedBy", "clerkOrgId")
    VALUES ('7521C934-772D-478E-8A00-9E29DBEE3644', 'openint-test', '2024-01-21 18:52:42.712', '2024-11-21 18:54:42.712', NULL, 'OpenInt-test', '2024-11-21 18:54:40.589', 'clzrhbt7900005', 'org_2qzodSa');
  `)
}

test('destinationSync', async () => {
  await setupAgFixtures()
  return
  const src = rxjs
    .from([
      {
        data: {
          entityName: 'candidate',
          id: 'cadi_123',
          entity: {
            raw: {first_name: 'John', last_name: 'Doe', id: '123'},
            unified: {name: 'tbd'},
          },
        } satisfies DeprecatedInputEntity,
        type: 'data' as const,
      },
      {type: 'commit' as const},
      {
        data: {
          entityName: 'job',
          id: 'job_123',
          entity: {
            raw: {_Name_c: 'new job'},
            unified: {id: '123', name: 'New job'},
          },
        } satisfies DeprecatedInputEntity,
        type: 'data' as const,
      },
      {type: 'commit' as const},
    ])
    .pipe(
      agLink2({
        source: {
          id: 'conn_123' as Id['conn'],
          connectorConfig: {connectorName: 'greenhouse'},
          customerId: 'cm3roaf0007',
        },
      }),
    )

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
  await toCompletion(destLink(src as any))
  const connections = await db.execute('SELECT * FROM "IntegrationConnection"')
  expect(connections[0]).toMatchObject({
    id: 'conn_123',
    clientId: 'cm3roaf0007',
    provider: 'greenhouse',
    label: 'greenhouse',
    profile: 'Ats',
    source: 'OpenInt',
  })
  const candidates = await db.execute('SELECT * FROM "IntegrationATSCandidate"')
  expect(candidates[0]).toMatchObject({
    connectionId: 'conn_123',
    id: 'cadi_123',
    clientId: 'cm3roaf0007',
    raw: {first_name: 'John', last_name: 'Doe', id: '123'},
    unified: {name: 'tbd'},
    isOpenInt: true,
    // Should be any ISODate
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    createdAt: expect.any(String),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    updatedAt: expect.any(String),
  })
  const jobs = await db.execute('SELECT * FROM "IntegrationATSJob"')
  expect(jobs[0]).toMatchObject({
    connectionId: 'conn_123',
    id: 'job_123',
    clientId: 'cm3roaf0007',
    raw: {_Name_c: 'new job'},
    unified: {name: 'New job', id: '123'},
    isOpenInt: true,
    // Should be any ISODate
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    createdAt: expect.any(String),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    updatedAt: expect.any(String),
  })
})

afterAll(() => db.$client.end())
