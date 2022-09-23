import PendingVerificationModel from "../db/models/pendingVerification";
import UserModel, { UserDocument } from "../db/models/User"

/*
  Creates the user document within mongodb jarms,
  given the input schema (payload).
*/

export async function createUser(
  input: typeof UserModel
  ){
  try{
    return await UserModel.create(input);
  } catch(e: any){
    throw new Error(e);
  }
}

export async function createPendingUser(
  input : typeof PendingVerificationModel){
    try{
      return await PendingVerificationModel.create(input);
    } catch(e: any){
      throw new Error(e);
    }
  }