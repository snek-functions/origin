import {send} from '@snek-functions/email'
import {usersUpdate} from '@snek-functions/iam'

import {fn, url} from './factory'
import {setAuthentication} from './helper/auth'

// Maybe this should be split into two functions
const resetPassword = fn<
  | {
      email: string
    }
  | {
      token: string
      password: string
    },
  void
>(
  async (
    args: {token?: string; email?: string; password?: string},
    _,
    {req, res}
  ) => {
    const {newToken, verify} = await import('./internal/token/factory.js')

    const {userGet} = await import('@snek-functions/iam')

    if (args.token) {
      const {sub, type} = verify(args.token)

      if (type === 'password_reset') {
        if (!sub) {
          throw new Error('No user id provided')
        }

        await usersUpdate({
          userId: sub,
          password: args.password
        })

        setAuthentication(sub, res)
      }
    }

    if (args.email) {
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
    }
  },
  {
    name: 'resetPassword',
    decorators: []
  }
)

export default resetPassword
