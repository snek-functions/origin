import {Decorator} from '@snek-at/functions'

import {
  REFRESH_TOKEN_COOKIE_NAME,
  TOKEN_COOKIE_NAME,
  USER_DATA_TOKEN_NAME
} from '../constants.js'

const loginRequired: Decorator = async (args, _, {req, res}) => {
  const {generateInternalToken, setAuthenticationCookies} = await import(
    '../helper/auth.js'
  )
  const {setUserCookie} = await import('../helper/user.js')
  const {refreshTokens, verify, newUserDataToken} = await import(
    '../internal/token/factory.js'
  )

  let tokenCookie = req.cookies[TOKEN_COOKIE_NAME]
  let refreshCookie = req.cookies[REFRESH_TOKEN_COOKIE_NAME]
  let userDataCookie = req.cookies[USER_DATA_TOKEN_NAME]

  let accessToken: string
  let refreshToken: string
  let userDataToken: string

  try {
    verify(tokenCookie)

    accessToken = tokenCookie
  } catch {
    // If the token is invalid, we need to refresh it

    try {
      const data = verify(refreshCookie)
      refreshToken = refreshCookie

      const newTokens = refreshTokens({
        refreshToken: refreshCookie,
        durration: '30d'
      })

      accessToken = newTokens.accessToken
      refreshToken = newTokens.refreshToken

      userDataToken = await newUserDataToken({
        userId: data.sub
      })

      setAuthenticationCookies(res, accessToken, refreshToken)
      setUserCookie(req, res, userDataToken)
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
