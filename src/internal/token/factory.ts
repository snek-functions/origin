import crypto from 'crypto'
import jwt from 'jsonwebtoken'

import {SHARED_SECRET} from '../../constants.js'
import {
  NewAccessToken,
  NewRefreshToken,
  Token,
  TokenPayload,
  TokenTypes
} from './types'

export const verify = (token: string) => {
  return jwt.verify(token, SHARED_SECRET) as TokenPayload
}

export const newToken = (
  {payload, subject, durration}: Token,
  type: TokenTypes,
  options: {
    jwtid?: string
  } = {}
) => {
  options.jwtid = options?.jwtid || crypto.randomUUID()

  const token = jwt.sign(
    {
      ...payload,
      type
    },
    SHARED_SECRET,
    {
      // The issuer can freely set an algorithm to verify the signature on the token. However, some supported algorithms are insecure
      // HMAC using SHA-256 hash algorithm
      algorithm: 'HS256',

      // Identifies the subject of the JWT
      subject: subject,
      // Identifies the expiration time on and after which the JWT must not be accepted for processing. The value must be in seconds or a string describing a time span vercel/ms
      expiresIn: durration,

      // Identifies principal that issued the JWT
      issuer: 'snek-0',
      // Case-sensitive unique identifier of the token even among different issuers
      jwtid: options.jwtid,
      audience: ''
    }
  )

  return {
    jwtid: options.jwtid,
    token
  }
}

export const newAccessToken = ({
  subject,
  payload,
  durration = '5m'
}: NewAccessToken) => {
  return newToken({payload, subject, durration}, 'access')
}

export const newRefreshToken = ({
  accessToken,
  payload,
  durration = '30d'
}: NewRefreshToken) => {
  // verify a token symmetric
  const {sub, jti} = verify(accessToken)

  const refreshToken = newToken(
    {
      payload,
      subject: sub,
      durration
    },
    'refresh',
    {
      jwtid: jti
    }
  )

  return refreshToken
}

export const refreshTokens = (payload: {
  refreshToken: string
  durration?: string
}) => {
  // verify a token symmetric
  const decodedRefreshToken = verify(payload.refreshToken)

  const accessToken = newAccessToken({
    subject: decodedRefreshToken.sub || 'unkown',
    payload: {
      scope: decodedRefreshToken.scope,
      fresh: false
    },
    durration: payload.durration
  })

  const refreshToken = newRefreshToken({
    accessToken: accessToken.token,
    payload: {
      scope: decodedRefreshToken.scope
    },
    durration: payload.durration
  })

  return {
    accessToken: accessToken,
    refreshToken: refreshToken
  }
}
