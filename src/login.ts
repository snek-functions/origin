import {authenticate} from '@snek-functions/authentication'

import {fn} from './factory'

const login = fn<{username: string; password: string}, void>(
  async (args, _, {req, res}) => {
    const {newUserDataToken} = await import('./helper/newUserDataToken.js')
    const {setAuthentication} = await import('./helper/auth.js')
    const {setUserCookie} = await import('./helper/user.js')

    const {data, errors} = await authenticate.execute(args)

    if (errors.length > 0) {
      throw new Error(errors[0].message)
    }

    if (data) {
      setAuthentication(data.user_id, res)

      const userDataToken = await newUserDataToken(data.user_id)

      setUserCookie(req, res, userDataToken)
    }
  },
  {
    name: 'login',
    decorators: []
  }
)

export default login
