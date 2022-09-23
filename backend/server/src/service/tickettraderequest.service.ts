import TicketTradeRequestModel from "../db/models/TicketTradeRequest"

/*
  Creates the ticket trade request document within mongodb jarms,
  given the input schema (payload).
*/

export async function createTicketTradeRequest(
  input: typeof TicketTradeRequestModel
  ){
  try{
    return await TicketTradeRequestModel.create(input);
  } catch(e: any){
    throw new Error(e);
  }
}