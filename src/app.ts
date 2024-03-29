import cors from 'cors'
import express from 'express'

import { ConfigureApp } from '@snek-at/functions'
import getServerlessApp from '@snek-at/functions/dist/server/getServerlessApp.js'
import { register } from '@snek-functions/registration'
import { usersUpdate } from '@snek-functions/iam'

import { setAuthentication } from './helper/auth.js'
import { verify } from './internal/token/factory.js'

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

      const token = req?.query?.token?.toString()

      if (!token) {
        throw new Error('No token provided')
      }

      const { sub, data, type } = verify(token)

      if (type === 'email_verification') {
        const { email, password, details } = data as {
          email: string
          password: string
          details: {
            firstName: string
            lastName: string
          }
        }

        try {
          const user = await register({ email, password, details })

          setAuthentication(user.userId, res)

          res.redirect(301, 'https://photonq.at/login?verify=true')
        } catch (e) {
          if (e instanceof Error) {
            res.redirect(
              403,
              `https://photonq.at/signup?error={"code":"002","msg":${e.message}}`
            )
          }
        }
      } else if (type === 'user_reactivate') {
        if (!sub) {
          throw new Error('No subject provided')
        }

        await usersUpdate({
          userId: sub,
          isActive: true
        })

        res.redirect(301, 'https://photonq.at/login?reactivate=true')
      }
    } catch (e) {
      if (e instanceof Error) {
        res.redirect(
          403,
          `https://photonq.at/signup?error={"code":"001","msg":"${e.message}"}`
        )
      }
    }
  })
}

export async function handler(event: Object, context: Object) {
  return await getServerlessApp({
    functions: '.'
  })(event, context)
}

// SPDX-License-Identifier: (EUPL-1.2)
// Copyright © 2019-2022 snek.at
