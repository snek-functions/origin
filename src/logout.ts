import {fn} from './factory'

import {
  COOKIE_OPTIONS,
  REFRESH_TOKEN_COOKIE_NAME,
  TOKEN_COOKIE_NAME,
  USER_DATA_TOKEN_NAME
} from './constants.js'
import loginRequired from './decorators/loginRequired.js'

const logout = fn<{username: string; password: string}, void>(
  async (args, _, {res}) => {
    res.clearCookie(TOKEN_COOKIE_NAME, COOKIE_OPTIONS)
    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, COOKIE_OPTIONS)
    res.clearCookie(USER_DATA_TOKEN_NAME, COOKIE_OPTIONS)
  },
  {
    name: 'logout',
    decorators: [loginRequired]
  }
)

export default logout
