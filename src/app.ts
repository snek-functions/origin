import {ConfigureApp} from '@snek-at/functions'
import getServerlessApp from '@snek-at/functions/dist/server/getServerlessApp.js'
import cors from 'cors'

export const configureApp: ConfigureApp = app => {
  app.use((req, res, next) => {
    return cors({
      origin: true,
      credentials: true
    })(req, res, next)
  })
}

export async function handler(event, context) {
  return await getServerlessApp({
    functions: '.'
  })(event, context)
}
