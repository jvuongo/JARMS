import EventModel from "../db/models/Event"

/*
  Creates an event object
  given the input schema (payload).
*/

export async function createUser(
  input: typeof EventModel
  ){
  try{
    return await EventModel.create(input);
  } catch(e: any){
    throw new Error(e);
  }
}