import {createClerkClient, Organization} from '@clerk/backend'
import {eq} from 'drizzle-orm'
import type {InferInsertModel, InferSelectModel} from 'drizzle-orm'
import {makeUlid} from '@openint/util'
import {schema} from '..'
import {initDbNeon} from '../db.neon'

const clerkSecretKey = process.env['CLERK_SECRET_KEY']
const dbUrl = process.env['DATABASE_URL']
if (!clerkSecretKey) throw new Error('CLERK_SECRET_KEY is not defined')
if (!dbUrl) throw new Error('DATABASE_URL is not defined')

const clerk = createClerkClient({secretKey: clerkSecretKey})
const db = initDbNeon(dbUrl)

type OrganizationSelect = InferSelectModel<typeof schema.organization>
type OrganizationInsert = InferInsertModel<typeof schema.organization>

/**
 * Gets all organizations from Clerk
 * @returns Array of Clerk organizations
 */
async function getClerkOrganizations() {
  console.log('Testing connectivity to Clerk API...')
  try {
    const response = await fetch('https://api.clerk.com/v1/heartbeat', {
      headers: {
        Authorization: `Bearer ${clerkSecretKey}`,
        'Content-Type': 'application/json',
      },
    })
    console.log(`Clerk API connectivity test status: ${response.status}`)
  } catch (error) {
    throw error
  }

  const organizations = await clerk.organizations.getOrganizationList()
  console.log(`Found ${organizations.data.length} organizations in Clerk`)

  return organizations
}

/**
 * Gets all organizations from the database
 * @returns Array of database organizations
 */
async function getDbOrganizations(): Promise<OrganizationSelect[]> {
  try {
    const organizations = await db.select().from(schema.organization)
    console.log(`Found ${organizations.length} organizations in database`)
    return organizations
  } catch (error) {
    console.error('Error fetching organizations from database:', error)
    throw error
  }
}

/**
 * Creates a new organization in the database
 * @param clerkOrg Organization data from Clerk
 */
async function createOrganization(clerkOrg: Organization): Promise<string> {
  try {
    const newOrgId = `org_${makeUlid()}`

    const newOrg: OrganizationInsert = {
      id: newOrgId,
      name: clerkOrg.name,
      api_key: clerkOrg.privateMetadata['api_key'] as string,
      metadata: JSON.stringify({
        ...clerkOrg.publicMetadata,
      }),
    }

    await db.insert(schema.organization).values(newOrg)

    console.log(
      `Created new organization in database: ${newOrgId} for Clerk org: ${clerkOrg.id}`,
    )
    return newOrgId
  } catch (error) {
    console.error(`Error creating organization: ${clerkOrg.id}`, error)
    throw error
  }
}

/**
 * Updates an existing organization in the database
 * @param dbOrg Existing organization in database
 * @param clerkOrg Organization data from Clerk
 */
async function updateOrganization(
  dbOrg: OrganizationSelect,
  clerkOrg: Organization,
) {
  try {
    const apiKey = clerkOrg.privateMetadata['api_key'] as string
    const metadata = JSON.stringify({
      clerk_metadata: clerkOrg.publicMetadata,
    })
    await db
      .update(schema.organization)
      .set({
        api_key: apiKey,
        metadata,
      })
      .where(eq(schema.organization.id, dbOrg.id))

    console.log(
      `Updated organization in database: ${dbOrg.id} for Clerk org: ${clerkOrg.id}`,
    )
  } catch (error) {
    console.error(`Error updating organization: ${dbOrg.id}`, error)
    throw error
  }
}

async function reconcileClerkOrgsToDB() {
  const clerkOrganizations = await getClerkOrganizations()
  const dbOrganizations = await getDbOrganizations()
  console.log({dbOrganizations, clerkOrganizations: clerkOrganizations.data})

  for (const clerkOrg of clerkOrganizations.data) {
    const existingDbOrg = dbOrganizations.find((o) => o.id === clerkOrg.id)
    if (existingDbOrg) {
      if (
        clerkOrg.privateMetadata['api_key'] &&
        clerkOrg.privateMetadata['api_key'] === existingDbOrg.api_key
      ) {
        console.log(
          `Org ${clerkOrg.id} already exists in DB with the same api_key`,
        )
      } else if (
        clerkOrg.privateMetadata['api_key'] !== existingDbOrg.api_key &&
        // If the api_key is null, undefined, or an empty string, we need to update it, Not replacing existing keys with new ones
        (existingDbOrg.api_key === null ||
          existingDbOrg.api_key === undefined ||
          existingDbOrg.api_key === '')
      ) {
        console.log(
          `Org ${clerkOrg.name}(${clerkOrg.id}) has a different api_key in DB, please review and update it manually`,
        )
        await updateOrganization(existingDbOrg, clerkOrg)
      }
    } else {
      console.log(
        `Org ${clerkOrg.name}(${clerkOrg.id}) does not exist in DB, creating...`,
      )
      await createOrganization(clerkOrg)
    }
  }
}

if (require.main === module) {
  reconcileClerkOrgsToDB()
    .then(() => {
      console.log('Reconciliation completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Reconciliation failed:', error)
      process.exit(1)
    })
}

export {reconcileClerkOrgsToDB}
