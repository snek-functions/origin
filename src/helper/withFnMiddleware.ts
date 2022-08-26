import {SnekFunction} from '@snek-at/functions/dist/types'
import {Request} from 'express'
import {withAuthorizationHeader} from './withAuthorizationHeader'

export function withFnMiddleware<FunctionArgs, FunctionReturn>(
  fn: SnekFunction<FunctionArgs, FunctionReturn>,
  req: Request
) {
  const headers = new Headers()

  withAuthorizationHeader(req, headers)

  return (args: FunctionArgs) => {
    return fn.execute(args, {
      headers: {
        ...Object.fromEntries(headers.entries())
      }
    })
  }
}
