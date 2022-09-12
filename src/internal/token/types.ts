import type {JwtPayload} from 'jsonwebtoken'

type ResourcesScope = {
  [key: string]: ResourceScope
}

type ResourceScope = string[]

export type AuthorizationScope = ResourcesScope | ResourceScope

export interface AccessTokenPayload extends JwtPayload {
  scope: AuthorizationScope
  fresh: boolean
}

export interface NewAccessToken {
  subject?: string
  scope: AuthorizationScope
  durration?: string
  fresh?: boolean
  data?: object
}

export interface NewRefreshToken {
  accessToken: string
  scope: AuthorizationScope
  durration?: string
}
