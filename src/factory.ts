import {makeFn} from '@snek-at/functions'

export const url = process.env.IS_OFFLINE
  ? process.env.CODESPACE_NAME
    ? `https://${process.env.CODESPACE_NAME}-4010.githubpreview.dev/graphql`
    : 'http://localhost:4010/graphql'
  : `${process.env.ENDPOINT_URL_IAM}`

export const fn = makeFn({
  url
})
