import {sendUserInformation} from '@snek-functions/email'
import loginRequired from './decorators/loginRequired'

import {fn} from './factory'
import {photonqCdlService} from './internal/photonq-cdl-service'

// Maybe this should be split into two functions
const requestForInformation = fn<{additional: string}, void>(
  async (args, _, {req, res}) => {
    const {userGet} = await import('@snek-functions/iam')

    const {getAuthentication} = await import('./helper/auth.js')

    const {userId, accessToken} = getAuthentication(req)
    const user = await userGet({userId: userId})

    const internalAuthorizationHeader = req.headers.authorization

    if (!internalAuthorizationHeader) {
      throw new Error(
        'Requesting user informatiom failed: Invalid internal authorization header'
      )
    }

    const experiments = await photonqCdlService.getExperiments({
      authorization: internalAuthorizationHeader
    })

    await sendUserInformation({
      email: user.email,
      subject: 'Your data at PhotonQ',
      firstName: user.firstName,
      lastName: user.lastName,
      userDataString: JSON.stringify(user),
      experimentsDataString: JSON.stringify(experiments),
      additionalDataString: args.additional
    })
  },
  {
    name: 'requestForInformation',
    decorators: [loginRequired]
  }
)

export default requestForInformation
