import { z } from 'zod'
import { ForgotPasswordSchema, LoginSchema, RegisterSchema, ResetPasswordSchema } from '@/schemas/auth'
import { Fields } from '@/hooks/use-form'
import { UUID } from 'crypto';
import qs from 'qs'
import { Chat } from '@/app/(chat-app)/chats/types';

export class HttpClient {
  private baseUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/v1`

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

  async fetchNewContacts(existingContacts: UUID[], search: string) {
    const queryParams = {
      search,
      where_clause: {
        id: {
          $not: {
            $in: existingContacts
          }
        }
      }
    }
    const response = await fetch(`${this.baseUrl}/users/list?${qs.stringify(queryParams)}`, {
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
  private async getChannels<T>(type: 'private' | 'group', search: string) {
    const response = await fetch(`${this.baseUrl}/channels/${type}-channels?search=${search}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    })
    return await response.json() as { message: string, data: T[] }
  }
  async getAllChannels(search: string) {
    const [privateChannels, groupChannels] = await Promise.all([
      this.getChannels<PrivateChannel>('private', search),
      this.getChannels<GroupChannel>('group', search)])
    const allChats: (GroupChannel | PrivateChannel)[] = []
    let i = 0, j = 0;
    while (i < privateChannels.data.length, j < groupChannels.data.length) {
      if (new Date(privateChannels.data[i].last_event_time) > new Date(groupChannels.data[j].last_event_time)) {
        allChats.push(privateChannels.data[i++])
      } else {
        allChats.push(groupChannels.data[j++])
      }
    }
    while (i < privateChannels.data.length) {
      allChats.push(privateChannels.data[i++])
    }
    while (j < groupChannels.data.length) {
      allChats.push(groupChannels.data[j++])
    }
    return allChats
  }

  async addContact(id: UUID) {
    const response = await fetch(`${this.baseUrl}/contacts/add-contact/${id}`, {
      method: 'POST',
      credentials: 'include'
    })
    const result = await response.json() as { message: string, data: { id: UUID } }
    return result.data
  }
  async sendMessage(message: string, iv: string) {
    const response = await fetch(`${this.baseUrl}/messages/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, iv }),
    })
  }
  async getMessages(channelId: UUID) {
    const queryParams = {
      where_clause: {
        channel_id: {
          $eq: channelId
        }
      },
    }
    const response = await fetch(`${this.baseUrl}/chats/list?${qs.stringify(queryParams)}`, {
      method: 'GET',
      credentials: 'include'
    })
    return await response.json() as { message: string, data: Chat[] }
  }

}

const httpClient = new HttpClient()
export default httpClient

export interface PrivateChannel {
  id: UUID;
  name: string;
  type: 'direct' | 'group';
  avatar?: string;
  user_id: UUID;
  is_pinned: boolean;
  is_muted: boolean;
  search: string;
  is_pending: boolean;
  have_blocked: boolean;
  unread_count: number;
  been_blocked: boolean;
  last_event_time: string;
  last_chat: {
    id: UUID;
    message: string;
    created_at: string;
    sender: string;
  } | null;
}

export interface GroupChannel {
  id: UUID;
  name: string;
  picture: string;
  type: 'direct' | 'group';
  avatar?: string;
  user_id: UUID;
  is_pinned: boolean;
  is_muted: boolean;
  joined_at: string;
  left_at: string;
  unread_count: number;
  last_event_time: string;
  last_chat: {
    id: UUID;
    message: string;
    created_at: string;
    sender: string;
  } | null;
}