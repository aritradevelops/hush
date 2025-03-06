import { z } from 'zod'
import { RegisterSchema } from '@/schemas/register'
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


}