import loginRequired from './decorators/loginRequired.js'
import {fn} from './factory'

const updateAccount = fn<{firstName: string; lastName: string}, void>(
  async (args, _, {req, res}) => {
    const {usersUpdate} = await import('@snek-functions/iam')

    const {getAuthentication} = await import('./helper/auth.js')
    const {newUserDataToken} = await import('./helper/newUserDataToken.js')
    const {setUserCookie} = await import('./helper/user.js')

    const {userId} = getAuthentication(req)

    const user = await usersUpdate({
      userId: userId,
      firstName: args.firstName,
      lastName: args.lastName
    })

    const userDataToken = await newUserDataToken(user.userId)

    setUserCookie(req, res, userDataToken)

    const internalAuthorizationHeader = req.headers.authorization

    if (!internalAuthorizationHeader) {
      throw new Error(
        'Update user informatiom failed: Invalid internal authorization header'
      )
    }
  },
  {
    name: 'updateAccount',
    decorators: [loginRequired]
  }
)

export default updateAccount
