
import { Base64 } from "js-base64";
import {Request, Response} from "express"
import UserModel from "../db/models/User";
import { EventInviteModel, FriendInviteModel } from "../db/models/Invite";
import logger from "../utils/logger";
import {UserType} from '../utils/types'
import TicketModel from "../db/models/Ticket";
import moment from "moment";


/* ========================================================================= //
                              Social Homepage CONTROLLERS
// ========================================================================= */
/* 
  Obtains all data for social home page for logged in user (friends, invites, recommended friends)
*/
export async function getSocialsController(req: Request, res: Response) {
  
  const token = req.headers.authorization;

  // Decode it and check against mongodb
  const user: UserType = JSON.parse(Base64.decode(token ?? ''));
  const userId = user['_id'];

  try {
    const user = await UserModel.findById(userId).populate("friends").lean();
    const eventInvites = await EventInviteModel.find({to: userId, status: "pending"}).populate("event").populate("from").lean();
    const friendInvites = await FriendInviteModel.find({to: userId, status: "pending"}).populate("from").lean();

    return res.send({
      user,
      invites: {
        events: eventInvites,
        friends: friendInvites
      }
    });
  } catch (e: any) {
      logger.error(e);
      return res.status(500).send("Invalid user");
  }
}


/* ========================================================================= //
                              Friends CONTROLLERS
// ========================================================================= */

/* 
  Sends a friend request
*/
export async function sendFriendRequestController(req: Request, res: Response) {
  const token = req.headers.authorization;

  const user: UserType = JSON.parse(Base64.decode(token ?? ''));
  const userId = user['_id'];


  const requestId = req.query.id?.toString();


  try {
      const request = await FriendInviteModel.create({
        from: userId,
        to: requestId,
        status: "pending"
      });

      return res.send(request.toJSON())

  } catch (e: any) {
      logger.error(e);
      return res.status(500).send("Invalid user");
  }
}

/* 
  Accept a friend request
*/
export async function acceptFriendRequestController(req: Request, res: Response) {
  const token = req.headers.authorization;

  const user: UserType = JSON.parse(Base64.decode(token ?? ''));
  const userId = user['_id'];

  
  const from = req.query.from?.toString();
  
  try {
      await FriendInviteModel.updateOne({from: from, to: userId}, {status: "accepted"});
      await UserModel.updateOne({_id: userId}, {$push: {friends: from}});
      await UserModel.updateOne({_id: from}, {$push: {friends: userId}});

      // Recombee integration.
      var recombee = require('recombee-api-client');
      var rqs = recombee.requests;
      var client = new recombee.ApiClient('jarms-dev', 'JZU68AyaIhdPkIVrsKyt4r6XuW24rzxdc15cVfJ1zjt6PcoQxIu6ckCMqtJscNE3');

      // Send interactions to recombee database.

      const fromUser = await UserModel.findById(from);
      const toUser = await UserModel.findById(userId);

          // Set property values of the from user.
          await client.send(new rqs.SetUserValues(from, {
              "friends": fromUser.friends,
          }, {
              'cascadeCreate': true
          }));  

          // Set property values of the to user.
          await client.send(new rqs.SetUserValues(userId, {
            "friends": toUser.friends,
          }, {
            'cascadeCreate': true
          }));  

      return res.status(200).send("success")

  } catch (e: any) {
      logger.error(e);
      return res.status(500).send("Invalid user");
  }
}

/* 
  Accept a event invite
*/
export async function acceptEventInviteController(req: Request, res: Response) {
  const token = req.headers.authorization;

  const user: UserType = JSON.parse(Base64.decode(token ?? ''));
  const userId = user['_id'];

  
  const from = req.query.from?.toString();
  
  try {
      // Update event invite status
      await EventInviteModel.updateOne({from: from, to: userId}, {status: "accepted"});
      return res.status(200).send("success")

  } catch (e: any) {
      logger.error(e);
      return res.status(500).send("Invalid user");
  }
}

/* 
  Remove a friend
*/
export async function removeFriendController(req: Request, res: Response) {
  const token = req.headers.authorization;

  const user: UserType = JSON.parse(Base64.decode(token ?? ''));
  const userId = user['_id'];
  const friend = req.query.friend?.toString();

  try {
    // remove friend from userId's friends list
    await UserModel.updateOne({_id: userId}, {$pull: {friends: friend}});
    // remove user from deleted friend's friends list
    await UserModel.updateOne({_id: friend}, {$pull: {friends: userId}});
    
    // Recombee integration.
    var recombee = require('recombee-api-client');
    var rqs = recombee.requests;
    var client = new recombee.ApiClient('jarms-dev', 'JZU68AyaIhdPkIVrsKyt4r6XuW24rzxdc15cVfJ1zjt6PcoQxIu6ckCMqtJscNE3');

    // Send interactions to recombee database.

      const fromUser = await UserModel.findById(userId);
      const toUser = await UserModel.findById(friend);

          // Set property values of the from user.
          await client.send(new rqs.SetUserValues(userId, {
              "friends": fromUser.friends,
          }, {
              'cascadeCreate': true
          }));  

          // Set property values of the to user.
          await client.send(new rqs.SetUserValues(friend, {
            "friends": toUser.friends,
          }, {
            'cascadeCreate': true
          })); 

    return res.status(200).send("success")

  } catch (e: any) {
      logger.error(e);
      return res.status(500).send("Invalid user");
  }
}

/*
  Show friend recommendations based on interested event types, previously attended events and mutual friends.
*/
export async function getFriendRecommendationsController(req: Request, res: Response) {
  try {
    const token = req.headers.authorization;
    
    const user: UserType = JSON.parse(Base64.decode(token ?? ''));
    const userId = user['_id'];
          
    const currentUser = await UserModel.findById(userId);

    // Recombee integration.
    var recombee = require('recombee-api-client');
    var rqs = recombee.requests;
    var client = new recombee.ApiClient('jarms-dev', 'JZU68AyaIhdPkIVrsKyt4r6XuW24rzxdc15cVfJ1zjt6PcoQxIu6ckCMqtJscNE3');

    // Send interactions to recombee database.

        var previouslyAttendedEvents = new Array();

        // Loop through current user's tickets array to get previously attended events.
        for (const i in currentUser.tickets) {
            const ticket = await TicketModel.findById(currentUser.tickets[i]);

            if (ticket != null) {
                if (moment(ticket.eventDate, "DD MMMM YYYY").isBefore(moment().format('DD MMMM YYYY'))) {
                  previouslyAttendedEvents.push(ticket.eid)
                }  
            }
        }

        // Set property values of the given user.
        await client.send(new rqs.SetUserValues(userId, {
          "previouslyAttendedEvents": previouslyAttendedEvents,
        }, {
          'cascadeCreate': true
        }));   

        var recommendedFriends = new Array();

          // Based on user's activity, recommends top users that are most likely to be of high relevance for a given user.
          client.send(new rqs.RecommendUsersToUser(userId, 8, {
              'cascadeCreate': true,
              'scenario': 'Friend-Recommendation',
              }),
          async (err, recommendations) => {
            for (const i in recommendations?.recomms) {
              const friend = await UserModel.findById(recommendations.recomms[i].id);
              if (friend != null) {
                  recommendedFriends.push(friend)
              }
            }
            return res.send(recommendedFriends)
          });
  }
  catch(e : any){
    logger.error(e)
    return res.status(409).send(e.message)
  }
}

/**
 * Decline friend request 
 */
 export async function declineFriendRequestController(req: Request, res: Response) {
  const token = req.headers.authorization;

  const inviteId = req.query.inviteId?.toString();

  const user: UserType = JSON.parse(Base64.decode(token ?? ''));
  const userId = user['_id'];


  const requestId = req.query.id?.toString();


  try {
      // Change invite status to declined where id matches inviteId and to matches userId
      await FriendInviteModel.updateOne({_id: inviteId, to: userId}, {$set: {status: "declined"}});
      return res.send("success")

  } catch (e: any) {
      logger.error(e);
      return res.status(500).send("Invalid user");
  }
}

/**
 * Decline event invite
 */
 export async function declineEventInviteController(req: Request, res: Response) {
  const token = req.headers.authorization;

  const inviteId = req.query.inviteId?.toString();

  const user: UserType = JSON.parse(Base64.decode(token ?? ''));
  const userId = user['_id'];


  const requestId = req.query.id?.toString();


  try {
      // Change invite status to declined where id matches inviteId and to matches userId
      await EventInviteModel.updateOne({_id: inviteId, to: userId}, {$set: {status: "declined"}});
      return res.send("success")

  } catch (e: any) {
      logger.error(e);
      return res.status(500).send("Invalid user");
  }
}