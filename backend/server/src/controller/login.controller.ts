import {Request, Response} from "express"
import PendingVerificationModel from "../db/models/pendingVerification";
import UserModel from "../db/models/User";
import logger from "../utils/logger"

/* ========================================================================= //
                              LOGIN CONTROLLERS
// ========================================================================= */

/* 
  Checks if user exist in the db with:
  - the same email
  - the same password
  > as the payload.
*/

export async function loginController(req: Request, res: Response){
  try{

    // Check if user exists
    const payloadEmail = req.body.email;

    const user = await UserModel.findOne({ email : payloadEmail});
    const pendingUser = await PendingVerificationModel.findOne({ email : payloadEmail});

    if (user != null){
      logger.info("User found : " + payloadEmail)
      // If user exists
      const payloadPassword = req.body.password;

      if(await user.compareHashAndPassword(payloadPassword) !== false){
        logger.info("Password is correct.")
        logger.info(user.toJSON());
        return res.send(user.toJSON());
      }
      else{
        logger.info("Password is incorrect.")
        logger.info(payloadPassword);
        // Send back error code 403 - forbidden
        // Mimics zod error payload
        var payload = [
          {message: 'Password is invalid.'}
        ]
        return res.send(payload);
      }
    }
    else{
      // Check if user is verified
      if(pendingUser !== null){
        var payload = [
          {message: 'User has not been verified. Please check email.'}
        ]
        return res.send(payload);
      }
      else{
        logger.info("No User with email: " + payloadEmail + " exists.")
        var payload = [
          {message: 'Email does not exist.'}
        ]
        return res.send(payload);
      }
    }  

  }
  catch(e : any){
    logger.error(e)
    return res.status(409).send("User does not exist, or password is wrong.")
  }
}


export async function verifyUserController(req: Request, res: Response){
  try{

    // Check if user exists
    const payloadEmail = req.body.email;

    const user = await UserModel.findOne({ email : payloadEmail});

    if (user != null){
      logger.info("User found : " + payloadEmail)
      
      // If user exists
      const payloadPassword = req.body.password;

      if(await user.compareHashAndPassword(payloadPassword) !== false){
        logger.info("Password is correct.")
        logger.info(user.toJSON());
        return res.send(user.toJSON());
      }
      else{
        logger.info("Password is incorrect.")
        // Send back error code 403 - forbidden
        // Mimics zod error payload
        var payload = [
          {message: 'Password is invalid'}
        ]
        return res.send(payload);
      }
    }
    else{
      logger.info("No User with email: " + payloadEmail + " exists.")
      var payload = [
        {message: 'Email does not exist'}
      ]
      return res.send(payload);
    }  

  }
  catch(e : any){
    logger.error(e)
    return res.status(409).send("User does not exist, or password is wrong.")
  }
}


