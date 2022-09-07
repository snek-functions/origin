import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import {userGet} from '@snek-functions/iam'
import {SHARED_SECRET} from '../../constants.js'
import {
  AccessTokenPayload,
  NewAccessToken,
  NewRefreshToken,
  UserDataToken
} from './types'

export const verify = (token: string) => {
  return jwt.verify(token, SHARED_SECRET) as AccessTokenPayload
}

export const newAccessToken = ({
  subject,
  scope,
  durration = '5m',
  fresh = false,
  data
}: NewAccessToken) => {
  let jwtId: string = crypto.randomUUID()

  let accessToken: string = jwt.sign(
    {
      scope: scope,
      fresh: !!fresh,
      type: 'access',
      data: data
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
      jwtid: jwtId,
      audience: ''
    }
  )

  return {
    accessToken,
    jwtId
  }
}

export const newRefreshToken = ({
  accessToken,
  scope,
  durration = '30d'
}: NewRefreshToken) => {
  // verify a token symmetric
  const {sub, jti} = jwt.verify(
    accessToken,
    SHARED_SECRET
  ) as AccessTokenPayload

  let refreshToken: string = jwt.sign(
    {
      type: 'refresh',
      scope: scope
    },
    SHARED_SECRET,
    {
      // The issuer can freely set an algorithm to verify the signature on the token. However, some supported algorithms are insecure
      // HMAC using SHA-256 hash algorithm
      algorithm: 'HS256',

      // Identifies the subject of the JWT
      subject: sub,
      // Identifies the expiration time on and after which the JWT must not be accepted for processing. The value must be in seconds or a string describing a time span vercel/ms
      expiresIn: durration,

      // Identifies principal that issued the JWT
      issuer: 'snek-0',
      // Case-sensitive unique identifier of the token even among different issuers
      jwtid: jti
    }
  )

  return {
    refreshToken,
    jwtId: jti
  }
}

export const refreshTokens = (payload: {
  refreshToken: string
  durration?: string
}) => {
  // verify a token symmetric
  const decodedRefreshToken = jwt.verify(
    payload.refreshToken,
    SHARED_SECRET
  ) as AccessTokenPayload

  const {accessToken} = newAccessToken({
    subject: decodedRefreshToken.sub || 'unkown',
    scope: decodedRefreshToken.scope,
    durration: payload.durration,
    fresh: false
  })

  const {refreshToken} = newRefreshToken({
    accessToken: accessToken,
    scope: decodedRefreshToken.scope,
    durration: payload.durration
  })

  return {
    accessToken: accessToken,
    refreshToken: refreshToken
  }
}

export const newUserDataToken = async ({userId}) => {
  const {data: user_data, errors} = await userGet.execute({
    userId
  })

  const userDataToken: UserDataToken = {
    username: user_data.username ?? 'default',
    firstname: user_data.firstName ?? 'default',
    lastname: user_data.lastName ?? 'default',
    email: user_data.email ?? 'default@gmail.com'
  }

  return JSON.stringify(userDataToken)
}
