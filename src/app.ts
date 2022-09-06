import {ConfigureApp} from '@snek-at/functions'
import getServerlessApp from '@snek-at/functions/dist/server/getServerlessApp.js'
import {register} from '@snek-functions/registration'
import cors from 'cors'
import {setAuthenticationCookies} from './helper/auth.js'
import {
  newAccessToken,
  newRefreshToken,
  verify
} from './internal/token/factory.js'
import {AccessTokenPayload} from './internal/token/types.js'

export const configureApp: ConfigureApp = app => {
  app.use((req, res, next) => {
    return cors({
      origin: true,
      credentials: true
    })(req, res, next)
  })

  app.use('/submit', async (req, res) => {
    let AccessTokenData: AccessTokenPayload
    try {
      AccessTokenData = verify(req.query.token.toString())
    } catch {
      // If the token is invalid, we need to refresh it
      throw new Error('Unable to verify')
    }
    const registerRes = await register.execute(AccessTokenData.data)

    if (registerRes.errors.length > 0) {
      res.redirect(403, 'https://photonq.at/signup')
      throw new Error(registerRes.errors[0].message)
    } else {
      const scope = {
        res1: ['read', 'write'],
        res2: ['read', 'write']
      }
      const {accessToken} = newAccessToken({
        subject: registerRes.data.userId.toString(),
        scope
      })

      const {refreshToken} = newRefreshToken({
        accessToken: accessToken,
        scope
      })

      setAuthenticationCookies(res, accessToken, refreshToken)

      res.redirect(301, 'https://photonq.at/login?verify=true')
    }
  })
}

export async function handler(event, context) {
  return await getServerlessApp({
    functions: '.'
  })(event, context)
}
