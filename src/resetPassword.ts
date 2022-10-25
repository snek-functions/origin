import { sendResetPassword } from '@snek-functions/email'

import { fn, url } from './factory'

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
    args: { token?: string; email?: string; password?: string },
    _,
    { req, res }
  ) => {
    const { newToken, verify } = await import('./internal/token/factory.js')
    const { setAuthentication } = await import('./helper/auth.js')

    const { userGet } = await import('@snek-functions/iam')

    if (args.token) {
      const { sub, type } = verify(args.token)

      if (type === 'password_reset') {
        const { usersUpdate } = await import('@snek-functions/iam')
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
      const user = await userGet({ alias: args.email })

      const { token } = newToken(
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

      await sendResetPassword({
        email: args.email,
        subject: 'Reset your Password at PhotonQ',
        link: `${url.replace('/graphql', '/reset')}?token=${token}`,
        firstName: user.firstName,
        lastName: user.lastName
      })
    }
  },
  {
    name: 'resetPassword',
    decorators: []
  }
)

export default resetPassword
