import { Request, Response, NextFunction } from "express";
import UserModel from "../db/models/User";
import { Base64 } from 'js-base64';
import logger from "../utils/logger"
import mongoose from "mongoose";
import { UserType } from "../utils/types";

/*
    Middleware to extract token parameters from url.
    I can try to validate schema instead, as an incorrect.
    Check to see if we can pass the userInDb to next function for eg.
*/

async function tokenExtraction (req: Request, res: Response, next: NextFunction) {
    try{
        // NOT IN URL PARAMS ANYMORE BUT IN HEADERS
        const token = req.headers.authorization;

        // Decode it and check against mongodb
        
        const user: UserType = JSON.parse(Base64.decode(token ?? ''));
        const userId = user['_id'];

        console.log("DECODED TOKEN: ", userId);

        //logger.info(decodedUserId)
        const userInDb = await UserModel.findById(userId);

        // Verify that user is real
        if(userInDb !== null){
            logger.info("User verified");
            next();
        } else {
            logger.info("User not verified");
            next();
        }
    } catch (e : any) {
        logger.error(e);
        
        return res.status(400).send('Invalid token');
    }
}

export default tokenExtraction;