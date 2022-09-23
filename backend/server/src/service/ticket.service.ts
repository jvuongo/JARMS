import TicketModel, { TicketDocument } from "../db/models/Ticket"

/*
  Creates the ticket document within mongodb jarms,
  given the input schema (payload).
*/

export async function createTicket(
  input: typeof TicketModel
  ){
  try{
    return await TicketModel.create(input);
  } catch(e: any){
    throw new Error(e);
  }
}