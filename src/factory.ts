import { makeFn } from '@snek-at/functions'

export const url = process.env.IS_OFFLINE
  ? process.env.CODESPACE_NAME
    ? `https://${process.env.CODESPACE_NAME}-5000.githubpreview.dev/graphql`
    : 'http://localhost:4000/graphql'
  : 'https://bf0xierewj.execute-api.eu-central-1.amazonaws.com/graphql'

export const fn = makeFn({
  url
})
