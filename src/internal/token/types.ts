import type {JwtPayload} from 'jsonwebtoken'

type ResourcesScope = {
  [key: string]: ResourceScope
}

type ResourceScope = string[]

export type AuthorizationScope = ResourcesScope | ResourceScope

export type TokenTypes =
  | 'access'
  | 'refresh'
  | 'password_reset'
  | 'email_verification'

export interface TokenPayload extends JwtPayload {
  scope: any
  data?: object
  type?: TokenTypes
}

export interface Token {
  payload: TokenPayload
  subject?: string
  durration?: string
}

export interface NewAccessToken extends Token {
  payload: TokenPayload & {
    fresh?: boolean
    scope: AuthorizationScope
  }
}

export interface NewRefreshToken extends Token {
  accessToken: string
  payload: TokenPayload & {
    scope: AuthorizationScope
    durration?: string
  }
}
