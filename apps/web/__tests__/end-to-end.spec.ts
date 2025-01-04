import {setupTestOrg} from './test-utils'

test('setupTestOrg', async () => {
  // await resetClerk()
  const res = await setupTestOrg()
  console.log(res)
})
