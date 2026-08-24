// ============================= Used to validate req.body =============================

import z from "zod"

const UserZodSchema = z.object({
    fullname: z
        .string()
        .trim()
        .min(2, { message: "Fullname should have atleast 2 characters" })
        .max(30),

    // Was missing entirely. `username` is required + unique on the Mongoose
    // model — without this, a request could pass validation here and still
    // fail (or silently omit username) at the DB layer.
    username: z
        .string()
        .trim()
        .toLowerCase()
        .min(3, { message: "Username should have atleast 3 characters" })
        .max(20)
        .regex(/^[a-z0-9_]+$/, { message: "Username can only contain lowercase letters, numbers, and underscores" }),

    email: z
        .string()
        .email({ message: "Please enter a valid email" }),

    // Was min(6) — the Mongoose schema requires minlength: 8. A 6-7 char
    // password used to pass this check and then fail Mongoose validation.
    password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters" }),

    phone: z
        .string()
        .regex(/^(?:\+91|91)?[6-9]\d{9}$/, { message: "Please enter a valid Phone Number" }),
})

// It will be used in login Functionality
const LoginZodSchema = UserZodSchema

    // .pick() prefers only listed fields inside it.
    .pick({ email: true, phone: true, password: true })

    // .partial() works as an optional
    .partial({ email: true, phone: true })

    // Login should NOT re-enforce the registration password-strength rule.
    // If that rule ever changes, existing users typing their correct
    // password would otherwise get rejected before `bcrypt.compare` even runs.
    .extend({
        password: z.string().min(1, { message: "Password is required" })
    })

    // .refine() works as a custom validation logic
    .refine(data => data.email || data.phone, {
        message: "Email or phone is required"
    })

// It will be used in changeCurrentPassword functionality
const PasswordChangeSchema = z.object({

    // .shape() access individual field validators
    oldPassword: UserZodSchema.shape.password,
    newPassword: UserZodSchema.shape.password
}).refine(data => data.oldPassword !== data.newPassword, {
    message: "New password must be different from the old password",
    path: ["newPassword"]
})

export { UserZodSchema, LoginZodSchema, PasswordChangeSchema }

export type UserInput = z.infer<typeof UserZodSchema>;
export type LoginInput = z.infer<typeof LoginZodSchema>;
export type PasswordChangeInput = z.infer<typeof PasswordChangeSchema>;
