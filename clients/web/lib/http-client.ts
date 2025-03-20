import { z } from 'zod'
import { ForgotPasswordSchema, LoginSchema, RegisterSchema, ResetPasswordSchema } from '@/schemas/auth'
import { Fields } from '@/hooks/use-form'
interface ApiResponse { }

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
}

const httpClient = new HttpClient()
export default httpClient