import {send} from '@snek-functions/email'
import {fn, url} from './factory'

const signup = fn<
  {
    email: string
    password: string
    details: {firstName: string; lastName: string}
  },
  void
>(
  async (args, _, {res}) => {
    const {newAccessToken} = await import('./internal/token/factory.js')
    const scope = {
      res1: ['read', 'write'],
      res2: ['read', 'write']
    }

    const {accessToken} = newAccessToken({
      subject: '0',
      data: args,
      scope
    })

    const emailRes = await send.execute({
      email: args.email,
      subject: 'Confirm Signup',
      msg: `Please follow the link to complete your registration: 
        <a href="${url.replace(
          '/graphql',
          '/submit'
        )}?token=${accessToken}" target="_blank">Confirm Registration</a>`
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
