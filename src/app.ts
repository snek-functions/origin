import {ConfigureApp} from '@snek-at/functions'
import getServerlessApp from '@snek-at/functions/dist/server/getServerlessApp.js'
import {register} from '@snek-functions/registration'
import cors from 'cors'
import express from 'express'
import {setAuthenticationCookies} from './helper/auth.js'
import {
  newAccessToken,
  newRefreshToken,
  verify
} from './internal/token/factory.js'

export const configureApp: ConfigureApp = app => {
  app.use((req, res, next) => {
    return cors({
      origin: true,
      credentials: true
    })(req, res, next)
  })

  app.use(express.urlencoded())

  app.use('/submit', async (req, res) => {
    try {
      console.log(JSON.stringify(req.query))
      const accessTokenData = verify(req.query.token.toString())

      const registerRes = await register.execute(accessTokenData.data)

      console.log(registerRes.data)

      if (registerRes.errors.length === 0) {
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
      } else {
        res.redirect(
          403,
          `https://photonq.at/signup?error={"code":"002","msg":${registerRes.errors[0].message}}`
        )
      }
    } catch (e) {
      console.log(e)
      res.redirect(
        403,
        `https://photonq.at/signup?error={"code":"001","msg":"Invalid token"}`
      )
    }
  })
}

export async function handler(event, context) {
  return await getServerlessApp({
    functions: '.'
  })(event, context)
}
