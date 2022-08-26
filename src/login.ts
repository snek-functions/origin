import {authenticate} from '@snek-functions/authentication'

import {fn} from './factory'

import {newAccessToken, newRefreshToken} from './internal/token/factory.js'

import {setAuthenticationCookies} from './helper/auth.js'

const login = fn<{username: string; password: string}, void>(
  async (args, _, {res}) => {
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
        subject: data.uid,
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
