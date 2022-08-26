import {Response} from 'express'
import {newAccessToken, verify} from '../internal/token/factory.js'

import {
  COOKIE_OPTIONS,
  LOGIN_REFRESH_TOKEN_COOKIE_MAX_AGE,
  LOGIN_TOKEN_COOKIE_MAX_AGE,
  REFRESH_TOKEN_COOKIE_NAME,
  TOKEN_COOKIE_NAME
} from '../constants.js'

export function setAuthenticationCookies(
  res: Response,
  accessToken: string,
  refreshToken: string
) {
  res.cookie(TOKEN_COOKIE_NAME, accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: LOGIN_TOKEN_COOKIE_MAX_AGE * 1000
  })
  res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: LOGIN_REFRESH_TOKEN_COOKIE_MAX_AGE * 1000
  })
}

export function generateInternalToken({
  ressourceId,
  accessToken
}: {
  ressourceId: string
  accessToken: string
}) {
  const parts = verify(accessToken)

  const {accessToken: limitedAccessToken} = newAccessToken({
    subject: parts.sub,
    scope: parts.scope[ressourceId]
  })

  return `Bearer ${limitedAccessToken}`
}
