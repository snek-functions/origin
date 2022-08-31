import {authenticate} from '@snek-functions/authentication'

import {fn} from './factory'

const login = fn<{username: string; password: string}, void>(
  async (args, _, {res}) => {
    const {newAccessToken, newRefreshToken} = await import(
      './internal/token/factory.js'
    )
    const {setAuthenticationCookies} = await import('./helper/auth.js')

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

      setAuthenticationCookies(res, accessToken, refreshToken)
    }
  },
  {
    name: 'login',
    decorators: []
  }
)

export default login
