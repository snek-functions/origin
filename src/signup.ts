import {send} from '@snek-functions/email'
import {signupEmail} from './email/signupEmail'
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
      scope,
      durration: '30d'
    })

    const emailRes = await send.execute({
      email: args.email,
      subject: 'Confirm your Registration at PhotonQ',
      msg: signupEmail(
        url,
        accessToken,
        args.details.firstName,
        args.details.lastName
      )
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
