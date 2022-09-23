import {object, string, TypeOf} from 'zod'

/*
  Zod schema. 
  Used for validation purposes.
*/

export const createTicketSchema = object({
  body: object({
    eid: string({
        required_error: "Not a valid event ID."
    })
  })
});
