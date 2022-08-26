import {Decorator} from '@snek-at/functions'

import {REFRESH_TOKEN_COOKIE_NAME, TOKEN_COOKIE_NAME} from '../constants.js'
import {
  generateInternalToken,
  setAuthenticationCookies
} from '../helper/auth.js'
import {refreshTokens, verify} from '../internal/token/factory.js'

const loginRequired: Decorator = async (args, _, {req, res}) => {
  let tokenCookie = req.cookies[TOKEN_COOKIE_NAME]
  let refreshCookie = req.cookies[REFRESH_TOKEN_COOKIE_NAME]

  let accessToken: string
  let refreshToken: string

  try {
    verify(tokenCookie)

    accessToken = tokenCookie
  } catch {
    // If the token is invalid, we need to refresh it

    try {
      verify(refreshCookie)

      refreshToken = refreshCookie

      const newTokens = refreshTokens({
        refreshToken: refreshCookie,
        durration: '30d'
      })

      accessToken = newTokens.accessToken
      refreshToken = newTokens.refreshToken

      setAuthenticationCookies(res, accessToken, refreshToken)
    } catch {
      throw new Error('Unable to authenticate')
    }
  }

  if (!accessToken) {
    throw new Error('This error should never be thrown')
  }

  req.headers.authorization = generateInternalToken({
    ressourceId: 'res1',
    accessToken
  })
}

export default loginRequired
