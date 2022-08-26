import {Request} from 'express'

import {withAuthorizationHeader} from './withAuthorizationHeader.js'

export async function proxyRequest(
  fetchParams: Parameters<typeof fetch>,
  req: Request
) {
  const [input, init] = fetchParams
  const headers: Headers = new Headers(init?.headers)

  withAuthorizationHeader(req, headers)

  if (!isWhitelisted(input)) {
    throw new Error(`URL is not whitelisted`)
  }

  const fetchRes = await fetch(input, {
    ...init,
    headers
  })

  return fetchRes
}

function isWhitelisted(input: RequestInfo | URL) {
  const FETCH_PROXY_WHITELIST = ['https://api.github.com']

  const url = input.toString()
  if (!FETCH_PROXY_WHITELIST.some(whitelist => url.startsWith(whitelist))) {
    return false
  }

  return true
}
