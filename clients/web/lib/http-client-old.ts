import { constants } from '@/config/constants';
import { Fields } from '@/hooks/use-form';
import { ForgotPasswordSchema, LoginSchema, RegisterSchema, ResetPasswordSchema } from '@/schemas/auth';
import { ApiListResponse, ApiResponse, ListParams } from '@/types/api';
import { Channel, Chat, Contact, DirectMessage, DirectMessageWithLastChat, Group, GroupMember, GroupWithLastChat, User } from '@/types/entities';
import { UUID } from 'crypto';
import { Flag } from 'lucide-react';
import { redirect } from 'next/navigation';
import qs from 'qs';
import { z } from 'zod';
const ApiActions = ['create', 'list', 'view', 'update', 'delete'] as const
const ApiModuleActionMap = {
  users: [...ApiActions],
  channels: [...ApiActions],
  chats: [...ApiActions],
  groups: [...ApiActions],
  contacts: [...ApiActions],
  'group-members': [...ApiActions],
  'direct-messages': [...ApiActions],
  'public-keys': [...ApiActions],
  secrets: [...ApiActions],
  auth: [...ApiActions, 'sign-in', 'refresh']
} as const

export type ApiModule = keyof typeof ApiModuleActionMap
export type ApiAction<M extends ApiModule> = typeof ApiModuleActionMap[M][number]
export interface FetchConfig<M extends ApiModule, D extends Record<string, unknown>> {
  action?: ApiAction<M>,
  id?: UUID
  params?: ListParams
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: D,
  headers?: Record<string, string>
}

export class HttpClient {
  private baseUrl = `${constants.SERVER_URL}/v1`
  async register(data: z.infer<typeof RegisterSchema>): Promise<{ fields: Partial<Fields<z.infer<typeof RegisterSchema>>>; success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/sign-up`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      const result = await response.json() as { message: string, errors: { field: keyof typeof data, message: string }[] }
      if (response.ok) {

        return { fields: {}, message: result.message, success: true }
      }
      const fields: Partial<Fields<z.infer<typeof RegisterSchema>>> = {}
      for (const err of result.errors) {
        if (fields[err.field]) {
          // @ts-ignore
          fields[err.field].errors.push(err.message)
        }
        else {
          fields[err.field] = { errors: [err.message], id: err.field }
        }
      }
      return { message: result.message, success: false, fields: fields }
    } catch (error) {
      return { success: false, message: (error as Error).message, fields: {} }
    }
  }

  async signIn(data: z.infer<typeof LoginSchema>): Promise<{ fields: Partial<Fields<z.infer<typeof RegisterSchema>>>; success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/sign-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include'
      })
      const result = await response.json() as { message: string, errors: { field: keyof typeof data, message: string }[] }
      if (response.ok) {

        return { fields: {}, message: result.message, success: true }
      }
      const fields: Partial<Fields<z.infer<typeof LoginSchema>>> = {}
      for (const err of result.errors) {
        if (fields[err.field]) {
          // @ts-ignore
          fields[err.field].errors.push(err.message)
        }
        else {
          fields[err.field] = { errors: [err.message], id: err.field }
        }
      }
      return { message: result.message, success: false, fields: fields }
    } catch (error) {
      return { success: false, message: (error as Error).message, fields: {} }
    }
  }

  async fetchNewContacts(search: string) {
    const queryParams = {
      search,
    }
    const response = await fetch(`${this.baseUrl}/users/new-users?${qs.stringify(queryParams)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    })
    return await response.json() as { message: string, data: { id: UUID, name: string, email: string, avatar: string }[] }
  }

  async forgotPassword(data: z.infer<typeof ForgotPasswordSchema>): Promise<{ fields: Partial<Fields<z.infer<typeof ForgotPasswordSchema>>>; success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      const result = await response.json() as { message: string, errors: { field: keyof typeof data, message: string }[] }
      if (response.ok) {

        return { fields: {}, message: result.message, success: true }
      }
      const fields: Partial<Fields<z.infer<typeof ForgotPasswordSchema>>> = {}
      for (const err of result.errors) {
        if (fields[err.field]) {
          // @ts-ignore
          fields[err.field].errors.push(err.message)
        }
        else {
          fields[err.field] = { errors: [err.message], id: err.field }
        }
      }
      return { message: result.message, success: false, fields: fields }
    } catch (error) {
      return { success: false, message: (error as Error).message, fields: {} }
    }
  }

  async verifyEmail(hash: string) {
    try {
      const response = await fetch(`${this.baseUrl}/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hash }),
      })
      if (!response.ok) return false
      return true
    } catch (error) {
      return false
    }
  }
  async resetPassword(data: z.infer<typeof ResetPasswordSchema> & { hash: string }): Promise<{ fields: Partial<Fields<z.infer<typeof ResetPasswordSchema>>>; success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      const result = await response.json() as { message: string, errors: { field: Exclude<keyof typeof data, 'hash'>, message: string }[] }
      if (response.ok) {

        return { fields: {}, message: result.message, success: true }
      }
      const fields: Partial<Fields<z.infer<typeof ResetPasswordSchema>>> = {}
      for (const err of result.errors) {
        if (fields[err.field]) {
          // @ts-ignore
          fields[err.field].errors.push(err.message)
        }
        else {
          fields[err.field] = { errors: [err.message], id: err.field }
        }
      }
      return { message: result.message, success: false, fields: fields }
    } catch (error) {
      return { success: false, message: (error as Error).message, fields: {} }
    }
  }

  private async list<T>(module: string, query: Partial<ListParams> = {}) {
    const response = await fetch(`${this.baseUrl}/${module}/list?${qs.stringify(query)}`, {
      method: 'GET',
      credentials: 'include'
    })
    const data = await response.json() as ApiListResponse<T>
    if ('errors' in data) {
      throw new Error(data.message)
    }
    return data
  }

  async listChannels(query: ListParams = {}) {
    return await this.list<Channel>('channels', query)
  }
  async listContacts(query: ListParams = {}) {
    return await this.list<Contact>('contacts', query)
  }
  async listUsers(query: ListParams = {}) {
    return await this.list<User>('users', query)
  }
  async getDirectMessageDetails(id: UUID) {
    const response = await fetch(`${this.baseUrl}/direct-messages/details/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    })
    return await response.json() as { message: string, data: DirectMessage & { contact: Contact | null } & { chat_user: User } }
  }
  async getGroupDetails(id: UUID) {
    const response = await fetch(`${this.baseUrl}/groups/details/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    })
    return await response.json() as { message: string, data: Group & { members: (GroupMember & { contact: Contact | null })[], me: User } }
  }

  async listGroupMembers(query: ListParams = {}) {
    return await this.list<GroupMember>('group-members', query)
  }
  async listDirectMessagesWithLastChat() {
    const response = await fetch(`${this.baseUrl}/direct-messages/list-with-last-chat`, {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'GET',
      credentials: 'include'
    })
    return await response.json() as { message: string, data: DirectMessageWithLastChat[] }
  }
  async listGroupsWithLastChat() {
    const response = await fetch(`${this.baseUrl}/groups/list-with-last-chat`, {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'GET',
      credentials: 'include'
    })
    return await response.json() as { message: string, data: GroupWithLastChat[] }
  }

  async getSharedSecret(channelId: UUID) {
    const response = await fetch(`${this.baseUrl}/secrets/channel/${channelId}`, {
      method: 'GET',
      credentials: 'include'
    })
    return await response.json() as { message: string, data: { encrypted_shared_secret: string } }
  }
  async getPublicKey(id: UUID) {
    const response = await fetch(`${this.baseUrl}/public_keys/public-key/${id}`, {
      method: 'GET',
      credentials: 'include'
    })
    return await response.json() as { message: string, data: { public_key: string } }
  }
  async addPublicKey(publicKey: string) {
    const response = await fetch(`${this.baseUrl}/users/add-public-key`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ public_key: publicKey }),
      credentials: 'include'
    })
    return await response.json() as { message: string, data: { id: UUID } }
  }
  async setSharedSecret(channelId: UUID, encryptedFor: UUID, encryptedSharedSecret: string) {
    const response = await fetch(`${this.baseUrl}/secrets/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ channel_id: channelId, encrypted_shared_secret: encryptedSharedSecret, user_id: encryptedFor }),
      credentials: 'include'
    })
    return await response.json() as { message: string, data: { id: UUID } }
  }
  async listMessages(channelId: UUID, perPage: number, page = 1) {
    const query: ListParams = {
      page,
      per_page: perPage,
      where_clause: {
        channel_id: {
          $eq: channelId
        }
      }
    }
    return await this.list<Chat>('chats', query)
  }
  async me() {
    const response = await fetch(`${this.baseUrl}/users/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    })
    return await response.json() as { message: string, data: User }
  }

  private async fetch<
    D extends Record<string, unknown> = any,
    R extends Record<string, unknown> = any,
    M extends ApiModule = ApiModule>(
      module: M,
      config: FetchConfig<M, D> = {
        method: 'GET',
        action: 'list',
      },
      retry = true
    ): Promise<{ response: Awaited<ReturnType<typeof fetch>>, result: ApiResponse<R> }> {
    let url = `${this.baseUrl}/${module}/${config.action}`
    if (config.id) {
      url += `/${config.id}`
    }
    if (config.params) {
      url += `/?${qs.stringify(config.params)}`
    }

    const response = await fetch(url, {
      method: config.method,
      headers: {
        'Content-Type': 'application/json',
        ...(config.headers || {})
      },
      body: config.method !== 'GET' && config.data ? JSON.stringify(config.data) : undefined,
      credentials: 'include'
    })

    const result = await response.json() as ApiResponse<R>

    if (response.status === 401 || response.status === 403) {
      if (!retry) redirect(`/login?next_url=${window.location.pathname}`)
      const refreshResponse = await this.refresh()
      if (refreshResponse.response.ok) {
        return await this.fetch(module, config, false)
      }
    }
    return { response, result }
  }
  async refresh() {
    return await this.fetch('auth', { action: 'refresh', method: 'POST' }, false)
  }
}
const httpClient = new HttpClient()
export default httpClient


