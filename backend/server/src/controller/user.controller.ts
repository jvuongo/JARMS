import { Request, Response } from "express";
import { pick } from "lodash";
import { CreateUserPayload } from "../schema/user.schema";
import { createUser, createPendingUser } from "../service/user.service";
import UserModel from "../db/models/User";
import logger from "../utils/logger";
import sgMail from "@sendgrid/mail";
import bcrypt from "bcrypt";
import { Base64 } from "js-base64";
import PendingVerificationModel from "../db/models/pendingVerification";
import { UserType } from "../utils/types";
import axios from "axios";

const config = require("config")

/* ========================================================================= //
                              USERS CONTROLLERS
// ========================================================================= */

/* 
  Creates a user.
*/
export async function createUserController(
  req: Request<{}, {}, CreateUserPayload["body"]>,
  res: Response
) {
  try {
    /*
      Sends an account registration confirmation email.
    */
    sgMail.setApiKey(
      "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"
    );
    const msg = {
      to: req.body.email,
      from: "meetic-notification-system@protonmail.com", // Verified sender
      templateId: "d-20fb589786da4c668f192c2ebd8b97f3",
      dynamic_template_data: {
        url:
          "http://localhost:3000/userVerification?payload=" +
          Base64.encode(JSON.stringify(req.body)),
      },
    };

    // Add user email to pendingVerification collection
    // If pendingUser exists throw error message
    const pendingUser = await PendingVerificationModel.findOne({
      email: req.body.email,
    }).exec();
    const user = await UserModel.findOne({ email: req.body.email }).exec();
    logger.info(pendingUser);
    // If first time registering
    if (pendingUser === null && user === null) {
      const pendingUserSent = await createPendingUser(req.body);
      // Send email
      sgMail
        .send(msg)
        .then(() => {
          console.log("Email sent");
        })
        .catch((error) => {
          console.error(error);
        });
      return res.send(pendingUserSent);
    } else if (user !== null) {
      var payload = [{ message: "Account already exists!" }];
      return res.send(payload);
    } else {
      // Mimics zod error payload
      var payload = [
        {
          message:
            "User has been registered but not verified. Please check your email!",
        },
      ];
      return res.send(payload);
    }
  } catch (e: any) {
    logger.error(e);
    return res.status(409).send(e.message);
  }
}

/* 
  Verify user.
  - after being verified then we create user
*/
export async function verifyUserController(req: Request, res: Response){
  try{
    if(req.query.payload !== 'undefined'){
      const body = JSON.parse(Base64.decode(req.query.payload));

      const user = await UserModel.findOne({ email: body.email }).exec();
      if (user === null) {
        const createdUser = await createUser(body);
        // Remove from pendingVerification collection aswell
        await PendingVerificationModel.deleteOne({email : createdUser.email}).exec();
      
        // // Create chat engine account
        const username = createdUser.first_name + '_' + createdUser.last_name;
        axios({
          method: 'POST',
          url : 'https://api.chatengine.io/users/',
          headers : {
            "PRIVATE-KEY" : "c0a4bf1d-2004-4ecd-8a49-d36bf7750172",
            "content-type" : "application/json"
          },
          data: {
            email : createdUser.email,
            first_name : createdUser.firstName,
            last_name : createdUser.lastName,
            secret : createdUser.email,
            username : createdUser.firstName + ' ' + createdUser.lastName
          }
        })
        .then(() => {
        })
        .catch((err) => console.log(err))
        await PendingVerificationModel.deleteOne({
          email: createdUser.email,
        }).exec();

        // omit password and other malleable values
        return res.send(
          createdUser.toJSON()
        );
      }
      return res.send("User already exists.");
    }
  } catch (e: any) {
    logger.error(e);
    return res.status(409).send("User cannot be found.");
  }
}

/*
  Sends a Resets password link
*/
export async function resetPasswordLinkController(req: Request, res: Response) {
  // Check if user exists
  const userInDb = await UserModel.findOne({ email: req.body.email });
  if (userInDb !== null) {
    /*
      Sends an account password reset email.
    */
    sgMail.setApiKey(
      "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"
    );
    const msg = {
      to: req.body.email,
      from: "meetic-notification-system@protonmail.com", // Verified sender
      templateId: "d-54aa0cd2259047158c26366f3c81d343",
      dynamic_template_data: {
        url: "http://localhost:3000/userResetPassword?payload=" + userInDb._id,
      },
    };

    sgMail
      .send(msg)
      .then(() => {
        console.log("Email sent");
      })
      .catch((error) => {
        console.error(error);
      });
    return res.send("Password reset link sent to");
  }
}

/*
  Resets password
*/
export async function resetPasswordController(req: Request, res: Response) {
  // Really unfortunate that I could not do this in a pre hook, but mongoose
  // does not support proper save() middleware for updating so I have to do salting here
  const salt = await bcrypt.genSalt(config.get("saltRounds"));
  const hash = await bcrypt.hashSync(req.body.password, salt);

  // Check if user exists
  const userInDb = await UserModel.findOneAndUpdate(
    { _id: req.body.userId },
    { password: hash }
  );

  // Any checks here?
  return res.send(userInDb);
}

/* 
  Obtains all users from db.
*/
export async function getUsersController(req: Request, res: Response) {
  try {
    /*
      Gets all users, and sends back a response.
    */
    const users = await UserModel.find();
    return res.send(users);
  } catch (e: any) {
    logger.error(e);
    return res.status(409).send(e.message);
  }
}

/* 
  Obtains a single user from db based on oid in url params/headers.
*/
export async function getSingleUserController(req: Request, res: Response) {
  try {
    const token = req.headers.authorization;
    const userLoggedIn: UserType = JSON.parse(Base64.decode(token ?? ""));
    const userLoggedInID = userLoggedIn["_id"];
    try {
        const token = req.headers.authorization;
        const userLoggedIn: UserType = JSON.parse(Base64.decode(token ?? ''));
        const userLoggedInID = userLoggedIn['_id'];
        try {
            const userid = req.query.uid?.toString();
            const user = await UserModel.findById(userid).populate("friends");
            if (user != null) {
                logger.info("User found : " + user);
            }
            else {
                logger.info("No user found for oid of: " + userid);
            }

            return res.send(user);
        }
        catch (e: any) {
            logger.error(e);
            return res.status(409).send("No user found");
        }
    } catch (e: any) {
      logger.error(e);
      return res.status(409).send("User cannot be found.");
    }
  } catch (e: any) {
    return res.status(400).send("Bad token.");
  }
}

export async function getFriendsController(req: Request, res: Response){
  try{
    const token = req.headers.authorization;
    const userLoggedIn: UserType = JSON.parse(Base64.decode(token ?? ''));
    const userLoggedInID = userLoggedIn['_id'];
    try {
      const friendList = await UserModel.findById(userLoggedInID).populate('friends');
      if (friendList != null) {
        return res.send(friendList['friends']);
      }
      else {
        logger.info("No user found for oid of: " + userLoggedInID);
      }
    }
    catch (e: any) {
        logger.error(e);
        return res.status(409).send("User cannot be found.");
    }
  } catch(e : any){
    return res.status(400).send("Bad token.");
  }
}
/* 
    Update avatar
  */
export async function updateAvatarController(req: Request, res: Response) {
  try {
    const token = req.headers.authorization;
    const userObject: UserType = JSON.parse(Base64.decode(token ?? ""));

    const avatar = req?.body?.src;

    // Update avatar in db
    await UserModel.updateOne({ _id: userObject._id }, { avatar: avatar });

    return res.status(200).send("Avatar updated");
  } catch (e: any) {
    logger.error(e);
    return res.status(409).send("User cannot be found.");
  }
}

/* 
  Get logged in user 
*/
export async function getMeController(req: Request, res: Response) {
  try {
    const token = req.headers.authorization;
    const userObject: UserType = JSON.parse(Base64.decode(token ?? ""));
    const user = await UserModel.findById(userObject._id);
    return res.send(user);
  } catch (e: any) {
    logger.error(e);
    return res.status(409).send(e.message);
  }
}

/* 
  Update logged in user 
*/
export async function updateMeController(req: Request, res: Response) {
  try {

    const token = req.headers.authorization;
    const userObject: UserType = JSON.parse(Base64.decode(token ?? ""));

    const fields = req?.body;

    // Update avatar in db
    const user = await UserModel.updateOne({ _id: userObject._id }, {$set: {...fields}});
    
    const currentUser = await UserModel.findById(userObject._id);

    // Recombee integration.
    var recombee = require('recombee-api-client');
    var rqs = recombee.requests;
    var client = new recombee.ApiClient('jarms-dev', 'JZU68AyaIhdPkIVrsKyt4r6XuW24rzxdc15cVfJ1zjt6PcoQxIu6ckCMqtJscNE3');

    // Send interactions to recombee database.

        // Set property values of the given user.
        await client.send(new rqs.SetUserValues(userObject._id, {
            "interestedEventTypes": currentUser.interestedEventTypes,
        }, {
            'cascadeCreate': true
        }));      


    return res.status(200).send("Profile updated");
  } catch (e: any) {
    logger.error(e);
    return res.status(409).send("User cannot be found.");
  }
}

/* 
  Obtains the current user using header
*/
export async function getCurrentUserController(req: Request, res: Response) {
  try {
      const token = req.headers.authorization;
      const userLoggedIn: UserType = JSON.parse(Base64.decode(token ?? ''));
      const userLoggedInID = userLoggedIn['_id'];
      try {
          const user = await UserModel.findById(userLoggedInID).populate("friends");;
          if (user != null) {
              logger.info("User found : " + user);
          }
          else {
              logger.info("No user found for oid of: " + userLoggedInID);
          }

          return res.send(user);
      }
      catch (e: any) {
          logger.error(e);
          return res.status(409).send("User cannot be found.");
      }
  } catch (e: any) {
      return res.status(400).send("Bad token.");
  }
}
