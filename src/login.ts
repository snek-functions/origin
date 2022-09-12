import {authenticate} from '@snek-functions/authentication'

import {fn} from './factory'

const login = fn<{username: string; password: string}, void>(
  async (args, _, {req, res}) => {
    const {newAccessToken, newRefreshToken} = await import(
      './internal/token/factory.js'
    )

    const {newUserDataToken} = await import('./helper/newUserDataToken.js')
    const {setAuthenticationCookies} = await import('./helper/auth.js')
    const {setUserCookie} = await import('./helper/user.js')

    const {data, errors} = await authenticate.execute(args)

    if (errors.length > 0) {
      throw new Error(errors[0].message)
    }

    if (data) {
      const scope = {
        res1: ['read', 'write'],
        res2: ['read', 'write']
      }

      const {accessToken} = newAccessToken({
        subject: data.user_id,
        scope
      })

      const {refreshToken} = newRefreshToken({
        accessToken: accessToken,
        scope
      })

      const userDataToken = await newUserDataToken({
        userId: data.user_id
      })

      setAuthenticationCookies(res, accessToken, refreshToken)
      setUserCookie(req, res, userDataToken)
    }
  },
  {
    name: 'login',
    decorators: []
  }
)

export default login
