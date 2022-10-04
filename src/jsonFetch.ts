import loginOptional from './decorators/loginOptional.js'
import {fn} from './factory'

export interface FetchResponse {
  headers: Headers
  ok: boolean
  redirected: boolean
  status: number
  statusText: string
  type: ResponseType
  url: string
  json: {
    [key: string]: any
  }
}

const jsonFetch = fn<[RequestInfo, string], FetchResponse>(
  async (fetchParams, _, {req, res}) => {
    const {proxyRequest} = await import('./helper/proxy.js')

    const proxiedRes = await proxyRequest(fetchParams, req)

    const responseData = {
      headers: proxiedRes.headers,
      ok: proxiedRes.ok,
      redirected: proxiedRes.redirected,
      status: proxiedRes.status,
      statusText: proxiedRes.statusText,
      type: proxiedRes.type,
      url: proxiedRes.url,
      json: await proxiedRes.json()
    }

    return responseData
  },
  {
    name: 'jsonFetch',
    decorators: [loginOptional]
  }
)

export default jsonFetch
