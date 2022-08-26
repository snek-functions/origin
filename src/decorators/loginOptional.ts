import {Decorator} from '@snek-at/functions'

import {REFRESH_TOKEN_COOKIE_NAME, TOKEN_COOKIE_NAME} from '../constants.js'
import loginRequired from './loginRequired.js'

const loginOptional: Decorator = async (args, _, {req, res}) => {
  const tokenCookie = req.cookies[TOKEN_COOKIE_NAME]
  const refreshCookie = req.cookies[REFRESH_TOKEN_COOKIE_NAME]

  if (tokenCookie || refreshCookie) {
    await loginRequired(args, _, {req, res})
  }
}

export default loginOptional
