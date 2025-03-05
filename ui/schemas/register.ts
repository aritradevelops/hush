import { z } from 'zod'

export const RegisterSchema = z.object({
  name: z.string({ required_error: "Full Name is required." }).min(3, { message: "Full Name must be at least 3 characters long." }),
  email: z.string({ required_error: "Email is required." }).email({ message: "Email must be a valid email address." }),
  password: z
    .string({ required_error: "Password is required." })
    .min(8, { message: "Password must be at least 8 characters long." })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter." })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
    .regex(/[\W_]/, { message: "Password must contain at least one special character." }), // \W matches non-word characters (special characters)
})
