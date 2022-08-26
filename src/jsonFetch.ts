import loginOptional from './decorators/loginOptional.js'
import {fn} from './factory'
import {proxyRequest} from './helper/proxy.js'

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

const jsonFetch = fn<Parameters<typeof fetch>, FetchResponse>(
  async (fetchParams, _, {req, res}) => {
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

    console.log(req.headers)

    return responseData
  },
  {
    name: 'jsonFetch',
    decorators: [loginOptional]
  }
)

export default jsonFetch
