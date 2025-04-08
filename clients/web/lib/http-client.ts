import { constants } from '@/config/constants';
import { Fields, Obj } from "@/hooks/use-form";
import { ForgotPasswordSchema, LoginSchema, RegisterSchema, ResetPasswordSchema } from "@/schemas/auth";
import { ApiErrorResponse, ApiListResponse, ApiListResponseSuccess, ApiResponse, ListParams } from "@/types/api";
import { ChannelOverview, PrimaryColumns, PublicKey, SharedSecret, User } from "@/types/entities";
import { UUID } from "crypto";
import qs from "qs";
import { z } from 'zod';

const ApiActions = ['create', 'list', 'view', 'update', 'delete'] as const
const ApiModuleActionMap = {
  users: [...ApiActions, 'me', 'unknowns'],
  channels: [...ApiActions, 'overview'],
  chats: [...ApiActions],
  groups: [...ApiActions],
  contacts: [...ApiActions],
  'group-members': [...ApiActions],
  'direct-messages': [...ApiActions],
  'public-keys': [...ApiActions],
  secrets: [...ApiActions],
  auth: [...ApiActions, 'sign-in', 'sign-up', 'refresh', 'forgot-password', 'verify-email', 'reset-password']
} as const

export type ApiModule = keyof typeof ApiModuleActionMap
export type ApiAction<M extends ApiModule> = typeof ApiModuleActionMap[M][number]
export interface FetchConfig<M extends ApiModule, D extends Obj> {
  action?: ApiAction<M>,
  id?: UUID
  params?: ListParams
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: D,
  headers?: Record<string, string>
}


export class HttpClient {
  private baseUrl = `${constants.SERVER_URL}/v1`
  private async fetch<
    D extends Obj = any,
    R extends Record<string, unknown> = any,
    M extends ApiModule = ApiModule>(
      module: M,
      config: FetchConfig<M, D> = {
      },
      retry = true
    ): Promise<{ response: Awaited<ReturnType<typeof fetch>>, result: ApiResponse<R> }> {
    const defaultConfig = {
      method: 'GET',
      action: 'list',
    }
    const mergedConfig = { ...defaultConfig, ...config }
    let url = `${this.baseUrl}/${module}/${mergedConfig.action}`
    if (mergedConfig.id) {
      url += `/${mergedConfig.id}`
    }
    if (mergedConfig.params) {
      url += `/?${qs.stringify(mergedConfig.params)}`
    }

    const response = await fetch(url, {
      method: mergedConfig.method,
      headers: {
        'Content-Type': 'application/json',
        ...(mergedConfig.headers || {})
      },
      body: mergedConfig.method !== 'GET' && mergedConfig.data ? JSON.stringify(mergedConfig.data) : undefined,
      credentials: 'include'
    })

    const result = await response.json() as ApiResponse<R>

    if (response.status === 401 || response.status === 403) {
      if (!retry) {
        window.location.href = `/login?next_url=${window.location.pathname}`
        return { response, result }
      }
      const refreshResponse = await this.refresh()
      if (refreshResponse.response.ok) {
        return await this.fetch(module, config, false)
      }
    }
    return { response, result }
  }

  private async list<D>(module: ApiModule, query: Partial<ListParams> = {}) {
    const { result } = await this.fetch(module, { params: query })
    return result as ApiListResponse<D>
  }

  private mapErrorsToFields<D extends Obj>(errors: ApiErrorResponse<D>['errors']) {
    const fields: Partial<Fields<D>> = {}
    for (const err of errors) {
      if (fields[err.field!]) {
        // @ts-ignore
        fields[err.field].errors.push(err.message)
      }
      else {
        // @ts-ignore
        fields[err.field!] = { errors: [err.message], id: err.field }
      }
    }
    return fields
  }
  async refresh() {
    return await this.fetch('auth', { action: 'refresh', method: 'POST' }, false)
  }

  async me() {
    const { result } = await this.fetch<User, User>('users', { action: 'me', method: 'GET' })
    if ('errors' in result) throw new Error(result.errors[0].message)
    return result
  }
  async register(data: z.infer<typeof RegisterSchema>): Promise<{ fields: Partial<Fields<z.infer<typeof RegisterSchema>>>; success: boolean; message: string }> {
    const { result } = await this.fetch<typeof data, typeof data>('auth', { action: 'sign-up', method: 'POST', data })
    if ('errors' in result) {
      const fields = this.mapErrorsToFields<typeof data>(result.errors)
      return { success: false, fields, message: result.message }
    }
    return { success: true, message: result.message, fields: {} }
  }
  async login(data: z.infer<typeof LoginSchema>): Promise<{ fields: Partial<Fields<z.infer<typeof LoginSchema>>>; success: boolean; message: string }> {
    const { result } = await this.fetch<typeof data, typeof data>('auth', { action: 'sign-in', data, method: 'POST' })
    if ('errors' in result) {
      const fields = this.mapErrorsToFields<typeof data>(result.errors)
      return { success: false, fields, message: result.message }
    }
    return { success: true, message: result.message, fields: {} }
  }
  async forgotPassword(data: z.infer<typeof ForgotPasswordSchema>): Promise<{ fields: Partial<Fields<z.infer<typeof ForgotPasswordSchema>>>; success: boolean; message: string }> {
    const { result } = await this.fetch<typeof data, typeof data>('auth', { action: 'forgot-password', data, method: 'POST' })
    if ('errors' in result) {
      const fields = this.mapErrorsToFields<typeof data>(result.errors)
      return { success: false, fields, message: result.message }
    }
    return { success: true, message: result.message, fields: {} }
  }
  async verifyEmail(hash: string) {
    const { response } = await this.fetch('auth', { action: 'verify-email', method: 'POST', data: { hash } })
    return response.ok
  }
  async resetPassword(data: z.infer<typeof ResetPasswordSchema> & { hash: string }): Promise<{ fields: Partial<Fields<z.infer<typeof ResetPasswordSchema>>>; success: boolean; message: string }> {
    const { result } = await this.fetch<typeof data, typeof data>('auth', { action: 'reset-password', data, method: 'POST' })
    if ('errors' in result) {
      const fields = this.mapErrorsToFields<typeof data>(result.errors)
      return { success: false, fields, message: result.message }
    }
    return { success: true, message: result.message, fields: {} }
  }

  async listUnknownsUsers(search: string = '') {
    const query: Partial<ListParams> = { search }
    const { result } = await this.fetch('users', { params: query, action: 'unknowns' })
    if ('errors' in result) throw new Error(result.message)
    return result as ApiListResponseSuccess<User>
  }

  async createPublicKey(data: Omit<PublicKey, keyof PrimaryColumns>) {
    const { result } = await this.fetch<typeof data, { id: UUID }>('public-keys', { action: 'create', method: 'POST', data })
    if ('errors' in result) throw new Error(result.message)
    return result
  }

  async listPublicKeysForUsers(userIds: UUID[]) {
    const query: Partial<ListParams> = {
      where_clause: {
        user_id: {
          $in: userIds
        }
      }
    }
    const result = await this.list<PublicKey>('public-keys', query)
    if ('errors' in result) throw new Error(result.message)
    return result
  }

  async createSharedSecret(data: Omit<SharedSecret, keyof PrimaryColumns>) {
    const { result } = await this.fetch<typeof data, { id: UUID }>('secrets', { action: 'create', method: 'POST', data })
    if ('errors' in result) throw new Error(result.message)
    return result
  }

  async getChannelsOverview() {
    const { result } = await this.fetch('channels', { action: 'overview' })
    if ('errors' in result) throw new Error(result.message)
    return result as ApiListResponseSuccess<ChannelOverview>
  }

}

const httpClient = new HttpClient()
export default httpClient