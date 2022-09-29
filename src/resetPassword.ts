import {send} from '@snek-functions/email'

import {fn, url} from './factory'

const resetPassword = fn<
  {
    email: string
  },
  void
>(
  async (args, _, {req, res}) => {
    const {newToken} = await import('./internal/token/factory.js')

    const {userGet} = await import('@snek-functions/iam')

    const user = await userGet({alias: args.email})

    const {token} = newToken(
      {
        subject: user.userId,
        payload: {
          data: {
            email: args.email
          },
          scope: null
        },

        durration: '5 minutes'
      },
      'password_reset'
    )

    console.log('token', token)

    await send({
      email: args.email,
      subject: 'Reset your Password at PhotonQ',
      msg: `
        <p>Click the link below to reset your password</p>
        <a href="${url.replace(
          '/graphql',
          '/reset'
        )}?token=${token}">Reset Password</a>
`
    })
  },
  {
    name: 'resetPassword',
    decorators: []
  }
)

export default resetPassword
