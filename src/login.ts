import {authenticate} from '@snek-functions/authentication'

import {fn} from './factory'
import {UserDataToken} from './internal/token/types.js'

const login = fn<{username: string; password: string}, void>(
  async (args, _, {res}) => {
    const {newAccessToken, newRefreshToken, newUserDataToken} = await import(
      './internal/token/factory.js'
    )
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
      setUserCookie(res, userDataToken)
    }
  },
  {
    name: 'login',
    decorators: []
  }
)

export default login
