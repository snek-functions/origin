import { send2fa } from '@snek-functions/email'
import { prepare } from '@snek-functions/registration'

import { fn, url } from './factory'

const signup = fn<
  {
    email: string
    password: string
    details: { firstName: string; lastName: string }
  },
  void
>(
  async (args, _, { res }) => {
    const { newToken } = await import('./internal/token/factory.js')
    const scope = {
      res1: ['read', 'write'],
      res2: ['read', 'write']
    }
    console.log(`registration email ${args.email}`)
    const preparedRegistrationData = await prepare({
      username: args.email,
      password: args.password,
      details: args.details
    })
    console.log(`prepared ${preparedRegistrationData}`)
    const { token } = newToken({
      subject: '0',
      payload: {
        data: preparedRegistrationData,
        scope
      },

      durration: '30d'
    }, 'email_verification')

    const emailRes = await send2fa.execute({
      email: args.email,
      subject: 'Confirm your Registration at PhotonQ',
      link: `${url.replace('/graphql', '/submit')}?token=${token}`,
      firstName: args.details.firstName,
      lastName: args.details.lastName
    })

    if (emailRes.errors.length > 0) {
      throw new Error(emailRes.errors[0].message)
    }
  },
  {
    name: 'signup',
    decorators: []
  }
)

export default signup
