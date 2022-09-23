import {number, object, string, TypeOf} from 'zod'

/*
  Zod schema. 
  Used for validation purposes.
*/

export const createUserSchema = object({
  body: object({
    firstName: string({}).nonempty("Please enter your first name."),
    lastName: string({}).nonempty("Please enter your last name."),
    // age: number({
    //   required_error: "Please enter an age."
    // }),
    password: string({}).min(8, "Password has to be minimum of 8 characters."),
    confirmPassword: string({}),
    email: string({}).email("Please enter a valid email.")

  }).refine((data) => data.password === data.confirmPassword, {
    message: "Password don't match.",
  })
})

export const loginSchema = object({
  body: object({
    email: string({}).email("Please enter a valid email."),
    password: string({}).min(8, "Password has to be minimum of 8 characters."),
  })
});

export const resetPasswordSchema = object({
  body: object({
    password:  string({}).min(8, "Password has to be minimum of 8 characters."),
    confirmedPassword: string({}).min(8, "Password has to be minimum of 8 characters."),
  }).refine((data) => data.password === data.confirmedPassword, {
    message: "Password don't match."
  })
})

// Within the UserDocument interface within DB/Models/User.ts there is no confirmPassword field.
export type CreateUserPayload = Omit<TypeOf<typeof createUserSchema>,"body.confirmPassword">;