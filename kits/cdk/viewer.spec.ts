import {makeJwtClient} from './viewer'

const jwt = makeJwtClient({secretOrPublicKey: 'mysecret'})

describe('makeJwtClient', () => {
  it('should create and verify a token', async () => {
    const token = await jwt.signViewer({role: 'system'})
    expect(token).toBeTruthy()
    const viewer = await jwt.verifyViewer(token)
    expect(viewer).toEqual({role: 'system'})
  })
})
