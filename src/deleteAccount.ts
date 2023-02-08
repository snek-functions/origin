import {userAuthenticate} from '@snek-functions/authentication'
import {sendDeleteUser} from '@snek-functions/email'

import {fn, url} from './factory'

// Maybe this should be split into two functions
const deleteAccount = fn<
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
    const {setAuthentication} = await import('./helper/auth.js')

    const {userGet} = await import('@snek-functions/iam')

    if (args.token) {
      const {data, type} = verify(args.token)

      if (type === 'user_delete') {
        const {usersDelete} = await import('@snek-functions/iam')

        if (!data) {
          throw new Error('No email provided')
        }

        const email = (data as {email: string}).email

        const {data: userData, errors} = await userAuthenticate.execute({
          username: email,
          password: args.password || '',
          resource: 'user_delete'
        })

        if (errors.length > 0) {
          throw new Error('Unable to find account')
        }

        await usersDelete({
          userId: userData.userId
        })
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
        'user_delete'
      )

      console.log('token', token)

      await sendDeleteUser({
        email: args.email,
        subject: 'Delete user at PhotonQ',
        link: `${url.replace('/graphql', '/delete')}?token=${token}`,
        firstName: user.firstName,
        lastName: user.lastName
      })
    }
  },
  {
    name: 'deleteAccount',
    decorators: []
  }
)

export default deleteAccount
