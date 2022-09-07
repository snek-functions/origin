import {Response} from 'express'

import {
  COOKIE_OPTIONS,
  USER_DATA_TOKEN_NAME,
  LOGIN_TOKEN_COOKIE_MAX_AGE
} from '../constants.js'

export function setUserCookie(res: Response, userDataToken) {
  res.cookie(USER_DATA_TOKEN_NAME, userDataToken, {
    ...COOKIE_OPTIONS,
    maxAge: LOGIN_TOKEN_COOKIE_MAX_AGE * 1000,
    httpOnly: false
  })
}
