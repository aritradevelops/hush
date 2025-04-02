import { constants } from '@/config/constants';
import { Fields } from '@/hooks/use-form';
import { ForgotPasswordSchema, LoginSchema, RegisterSchema, ResetPasswordSchema } from '@/schemas/auth';
import { ApiListResponse, ListParams } from '@/types/api';
import { Channel, Chat, Contact, DirectMessage, DirectMessageWithLastChat, GroupMember, GroupWithLastChat, User } from '@/types/entities';
import { UUID } from 'crypto';
import qs from 'qs';
import { z } from 'zod';

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

  async addContact(id: UUID) {
    const response = await fetch(`${this.baseUrl}/contacts/add-contact/${id}`, {
      method: 'POST',
      credentials: 'include'
    })
    const result = await response.json() as { message: string, data: { id: UUID } }
    return result.data
  }

  private async list<T>(module: string, query: ListParams = {}) {
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
    const response = await fetch(`${this.baseUrl}/users/public-key/${id}`, {
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
  async listMessages(channelId: UUID, page = 1) {
    const query: ListParams = {
      page,
      where_clause: {
        channel_id: {
          $eq: channelId
        }
      }
    }
    const response = await fetch(`${this.baseUrl}/chats/list?${qs.stringify(query)}`, {
      method: 'GET',
      credentials: 'include'
    })
    return await response.json() as { message: string, data: Chat[] }
  }
}
const httpClient = new HttpClient()
export default httpClient
