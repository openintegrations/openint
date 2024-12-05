import {sql} from 'drizzle-orm'
import {drizzle} from 'drizzle-orm/postgres-js'
import type {EndUserId, Id} from '@openint/cdk'
import type {DeprecatedInputEntity} from '@openint/connector-postgres'
import {postgresServer} from '@openint/connector-postgres'
import {env} from '@openint/env'
import {rxjs, toCompletion} from '@openint/util'
import {agLink} from './agLink'

// console.log('filename', __filename)
const dbName = 'aglink'

// TODO: Add me back in once we know CI is working
beforeAll(async () => {
  const masterDb = drizzle(env.POSTGRES_URL, {logger: true})
  await masterDb.execute(`DROP DATABASE IF EXISTS ${dbName}`)
  await masterDb.execute(`CREATE DATABASE ${dbName}`)
  await masterDb.$client.end()
})

const dbUrl = new URL(env.POSTGRES_URL)
dbUrl.pathname = `/${dbName}`
const db = drizzle(dbUrl.toString(), {logger: true})

const destLink = postgresServer.destinationSync({
  config: {},
  endUser: {id: 'esur_12' as EndUserId, orgId: 'org_123'},
  settings: {databaseUrl: dbUrl.toString()},
  source: {id: 'reso_sfdc_9287', connectorName: 'sfdc'},
  state: {},
})

async function setupAgFixtures() {
  await db.execute(sql`
    CREATE TABLE "public"."Client" (
        "id" text NOT NULL,
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
    CREATE SEQUENCE IF NOT EXISTS "IntegrationConnection_clientSortIdx_seq";
    DROP TYPE IF EXISTS "public"."IntegrationProfile";
    CREATE TYPE "public"."IntegrationProfile" AS ENUM ('Hris', 'Ats', 'Cap', 'Performance', 'PayrollHistory', 'Position', 'ATSJob');
    DROP TYPE IF EXISTS "public"."IntegrationSource";
    CREATE TYPE "public"."IntegrationSource" AS ENUM ( 'Merge',  'OpenInt');
    CREATE TABLE "public"."IntegrationConnection" (
        "id" text NOT NULL,
        "createdAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "clientId" text NOT NULL,
        "provider" text NOT NULL,
        "label" text NOT NULL,
        "profile" "public"."IntegrationProfile" NOT NULL,
        "source" "public"."IntegrationSource" NOT NULL,
        "deletedAt" timestamp,
        "clientSortIdx" int4 NOT NULL DEFAULT nextval('"IntegrationConnection_clientSortIdx_seq"'::regclass),
        CONSTRAINT "IntegrationConnection_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        PRIMARY KEY ("id")
    );
    CREATE TABLE "public"."IntegrationATSCandidate" (
        "id" text NOT NULL,
        "clientId" text NOT NULL,
        "connectionId" text NOT NULL,
        "candidate_name" text NOT NULL,
        "opening_external_id" text NOT NULL,
        "isOpenInt" bool DEFAULT false,
        "raw" jsonb NOT NULL DEFAULT '{}'::jsonb,
        "unified" jsonb NOT NULL DEFAULT '{}'::jsonb,
        "createdAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "IntegrationATSCandidate_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "IntegrationATSCandidate_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "public"."IntegrationConnection"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        PRIMARY KEY ("id")
    );
    CREATE TABLE "public"."IntegrationATSJob" (
        "id" text NOT NULL,
        "clientId" text NOT NULL,
        "connectionId" text NOT NULL,
        "external_job_id" text NOT NULL,
        "offer_external_id" text NOT NULL,
        "isOpenInt" bool DEFAULT false,
        "raw" jsonb NOT NULL DEFAULT '{}'::jsonb,
        "unified" jsonb NOT NULL DEFAULT '{}'::jsonb,
        "createdAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "IntegrationATSJob_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "public"."IntegrationConnection"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "IntegrationATSJob_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        PRIMARY KEY ("id")
    );
    CREATE TABLE "public"."IntegrationATSOffer" (
        "id" text NOT NULL,
        "clientId" text NOT NULL,
        "connectionId" text NOT NULL,
        "opening_external_id" text NOT NULL,
        "candidate_name" text NOT NULL,
        "isOpenInt" bool DEFAULT false,
        "raw" jsonb NOT NULL DEFAULT '{}'::jsonb,
        "unified" jsonb NOT NULL DEFAULT '{}'::jsonb,
        "createdAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "IntegrationATSOffer_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "public"."IntegrationConnection"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "IntegrationATSOffer_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        PRIMARY KEY ("id")
    );
    CREATE TABLE "public"."IntegrationATSOpening" (
        "id" text NOT NULL,
        "clientId" text NOT NULL,
        "connectionId" text NOT NULL,
        "opening_external_id" text NOT NULL,
        "job_id" text NOT NULL,
        "isOpenInt" bool DEFAULT false,
        "raw" jsonb NOT NULL DEFAULT '{}'::jsonb,
        "unified" jsonb NOT NULL DEFAULT '{}'::jsonb,
        "createdAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "IntegrationATSOpening_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "IntegrationATSOpening_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "public"."IntegrationConnection"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        PRIMARY KEY ("id")
    );
  `)
  await db.execute(sql`
    INSERT INTO "public"."Client" ("id", "slug", "createdAt", "updatedAt", "deletedAt", "legalName", "clerkCreatedAt", "clerkCreatedBy", "clerkOrgId")
    VALUES ('cm3roaf0007', 'openint-test', '2024-01-21 18:52:42.712', '2024-11-21 18:54:42.712', NULL, 'OpenInt-test', '2024-11-21 18:54:40.589', 'clzrhbt7900005', 'org_2qzodSa');
  `)
}

test('destinationSync', async () => {
  await setupAgFixtures()
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
      agLink({
        source: {
          id: 'conn_123' as Id['reso'],
          connectorConfig: {connectorName: 'greenhouse'},
          endUserId: 'cm3roaf0007',
        },
      }),
    )

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
  await toCompletion(destLink(src as any))
  const connections = await db.execute('SELECT * FROM "IntegrationConnection"')
  expect(connections[0]).toMatchObject({
    id: 'conn_123',
    clientId: 'cm3roaf0007',
    provider: 'openint',
    label: 'OpenInt',
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
