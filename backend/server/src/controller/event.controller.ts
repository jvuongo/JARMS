import { Request, Response } from "express";
import { omit } from "lodash";
import { CreateUserPayload } from "../schema/user.schema";
import { createUser } from "../service/user.service";
import logger from "../utils/logger";
import EventModel from "../db/models/Event";
import { EventInviteModel } from "../db/models/Invite";
import UserModel from "../db/models/User";
import { Base64 } from "js-base64";
import { getUsersController } from "./user.controller";
import moment from "moment";
import {UserType} from '../utils/types'
import TicketModel from "../db/models/Ticket";
import sgMail from '@sendgrid/mail';
import fetch from 'node-fetch'


interface CreateEventInput {
  eventName: string;
  eventDescription: string;
  eventTags: string[];
  eventStartDate: string;
  eventEndDate: string;
  isPrivate: boolean;
  maxGuests: number;
  ticketPrice: number;
  eventLocation: string;
  eventInvites?: string[];
  imageUrl: string;
  user_id: string;
}

/* ========================================================================= //
                              EVENT CONTROLLERS
// ========================================================================= */

/* 
  Obtains all events from db.
*/
export async function getEventsController(req: Request, res: Response) {
  try {

    const token = req.headers.authorization;
    const userObject: UserType = JSON.parse(Base64.decode(token ?? ''));
    const userId = userObject['_id'];
    const user = await UserModel.findById(userId);

    let events = []
    if (user) {
      console.log("GOT TOKEN")
      events = await EventModel.find().populate("host").populate("attendees");

      events.filter(event => {
        // if event is private, only return if host _id is in users friends list
        if (event.isPrivate) {
          return user.friends.includes(event.host._id);
        }
      })
    } else {
      console.log("NO TOKEN")
      events = await EventModel.find({isPrivate: false}).populate("host").populate("attendees");
    }

    return res.send(events);
  } catch (e: any) {
    logger.error(e);
    return res.status(409).send("No events");
  }
}

/* 
  Obtains a single event from db based on oid in url params/headers.
*/
export async function getSingleEventController(req: Request, res: Response) {
  try {
    logger.info("BLASTED")
    logger.info(req.headers)
    const eventId = req.query.eid?.toString();
    const event = await EventModel.findById(eventId).populate('host');
    if (event != null) {
      logger.info("Event found : " + event);
    } else {
      logger.info("No event found for eid of: " + eventId);
    }

    return res.send(event);
  } catch (e: any) {
    logger.error(e);
    return res.status(409).send("Event cannot be found.");
  }
}

/* 
  Create an event
*/
export async function createEventController(
  req: Request<{}, {}>,
  res: Response
) {
  try {
    /*
      Creates a user, and sends back a response.
      req.body is CreateUserPayload["body"].
    */
    const payload: CreateEventInput = req.body;

    // Fetch host profile
    const user = await UserModel.findById(payload.user_id);
    if (user != null) {
      logger.info("User found : " + user);
    } else {
      logger.info("No user found for oid of: " + user);
    }

    try {
      const event = await EventModel.create({
        title: payload.eventName,
        description: payload.eventDescription,
        ticketPrice: payload.ticketPrice ?? 0,
        tags: payload.eventTags,
        startDate: payload.eventStartDate,
        endDate: payload.eventEndDate,
        maxGuests: payload.maxGuests,
        isPrivate: payload.isPrivate ?? false,
        location: payload.eventLocation,
        image: payload.imageUrl,
        host: payload.user_id,
        attending: [payload.user_id],
        comments: [],
      });



      // Send out invites if there are any
      if (payload.eventInvites !== undefined && payload.eventInvites.length > 0) {
        payload.eventInvites.map((invite) => {
          try {
            EventInviteModel.create({
              event: event._id,
              from: payload.user_id,
              to: invite,
              status: "pending"
            });
          } catch (e: any) {
            logger.error(e.message);
          }
        });
      }


      return res.send(event.toJSON())
    } catch (e: any) {
      throw new Error(e);
    }
  } catch (e: any) {
    logger.error(e);
    return res.status(409).send(e.message);
  }
}

/* 
  Delete an event from db based on eid
*/
export async function deleteEventController(req: Request, res: Response) {
    try {

        const event_id = req.query._id?.toString();
        const event = await EventModel.findById(event_id);
        if (event != null) {
            logger.info("Event found : " + event)

            // delete found event
            event.delete();

            return res.sendStatus(200)
        }
        else {
            logger.info("No event found for eid of: " + event_id)
        }

    }
    catch (e: any) {
        logger.error(e)
        return res.status(409).send("Event cannot be found.")
    }
}

/**
 * Obtains current users events
 */
 export async function getMyEventsController(req: Request, res: Response) {
  const token = req.headers.authorization;

  const user: UserType = JSON.parse(Base64.decode(token ?? ''));
  const userId = user['_id'];

  try {
    const events = await EventModel.find({ host: userId });
    return res.send(events);
  } catch (e: any) {
      logger.error(e);
      return res.status(500).send("Invalid user");
  }
}

/**
 * Obtains current users events
 */
 export async function deleteMyEventController(req: Request, res: Response) {   
  const token = req.headers.authorization;

  const user: UserType = JSON.parse(Base64.decode(token ?? ''));
  const userId = user['_id'];

  const eventid = req.query.eid?.toString();
  const currentEvent = await EventModel.findById(eventid).populate('tickets');

  try {
      // Send cancellation of event emails.
      // Retrieve emails of attendees of respective event.
      await fetch('http://localhost:2102/eventattendees?eid=' + eventid)
      .then(res => res.json())
      .then((data) => {
          if (data != '') {
              sgMail.setApiKey('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')
              const msg = {
                  to: data,
                  from: 'meetic-notification-system@protonmail.com',
                  templateId: 'd-fba2cfd5aa3e43159c0acc54fe49c9f4',
                  dynamic_template_data: {
                    eventid: currentEvent._id,
                    eventname: currentEvent.title,
                  },
              };
          sgMail.sendMultiple(msg);
          }
      });

    // Process refunds from cancellation of event.
    // Retrieve payment transaction IDs of respective event.
    await fetch('http://localhost:2102/payments?eid=' + eventid)
    .then(res => res.json())
    .then((data) => {
        // Loop through payment ID array.
        for (const i in data) {
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type' : 'application/json', 'Authorization' : 'Basic QVhOMVNMMDgydXBWWkN3a2lKOUxBWVIzYm9ZcjNkNV9hbWZEVWx1LVh4OGZiZU1qVTZGdDZSdDJSWXZHX1JMZENjZzdxTUtCcTczcU5NRlU6RU90WElLUVJGaWxKcmw0cEVLZFUtQnNXVlprbkdISGtGZUZ5VHlrVFUyMW95bjZ3RGdsSzh0MUFuWFR3amVJY2NCTlFlQnRXQ05IVUt6SVM='}
            };

            // Send payload to endpoint to refund ticket transaction.
            fetch('https://api-m.sandbox.paypal.com/v2/payments/captures/' + data[i] + '/refund', requestOptions)
        }
		});

    // Loop through tickets of current event
    for (const ticket of currentEvent.tickets) {
	await ticket.delete()
    }
    
    // Delete events    
    const event = await EventModel.deleteOne({ _id: eventid, host: userId });
    return res.send(event);
  } catch (e: any) {
      logger.error(e);
      return res.status(500).send("Invalid user");
  }
}
   
   
/*
  Attaches attending user to an event
*/
export async function attachAttendeeController(req: Request, res: Response) {
  try{

    const token = req.headers.authorization;
    const userObject: UserType = JSON.parse(Base64.decode(token ?? ''));

    const user = await UserModel.findById(userObject._id);

    const eventid = req.query.eid?.toString();
    const event = await EventModel.findById(eventid);

    if (event != null && user != null){

        // Attaches respective attendee

        event.save(event.attendees.push(user));
        logger.info("Successfully attached user to event: " + event)

        return res.sendStatus(200)
    }
    // else if (user == null) {
    //   logger.info("No user found for oid of: " + userid)
    // }
    // else {
    //   logger.info("No ticket found for tid of: " + eventid)
    // }

  }
  catch(e : any){
    logger.error(e)
    return res.status(409).send(e.message)
  }
}

/* 
  Obtains all attending events from particular user.
*/
export async function getUserAttendingEventsController(req: Request, res: Response){
  try{

    const token = req.headers.authorization;

    const userObject: UserType = JSON.parse(Base64.decode(token ?? ''));
    const userId = userObject['_id'];
    const user = await UserModel.findById(userId);
    if (user != null){
      //logger.info("User found : " + user)
    } 
    else{
      logger.info("No user found for oid of: " + userId)
    }
    
    const attendingEvents = await UserModel.find(user, 'attendingEvents')
    .populate({path: 'attendingEvents',
               populate: {
                 path: 'host'
              }
    });
    var currentDate = moment().format('DD MMMM YYYY')
    logger.info("Date: " + currentDate)
    var upcomingEvents = new Array();
    var pastEvents = new Array();
    // Loop through each event attended by the user and check if the current date is before the starting date
    // If it is, then put it in the upcomingEvents array - What Steven suggested 
    // If it is not, then put it in the pastEvents array - What Steven suggested 
    for (const event of attendingEvents[0].attendingEvents) {
      var eventStartDate = moment(event.startDate).format('DD MMMM YYYY')
      logger.info("Event date " + eventStartDate)
      if (moment(eventStartDate).isSameOrAfter(currentDate) && event.host._id != userId) {
        upcomingEvents.push(event)
      } else {
        pastEvents.push(event)
      }
    }
    let events = {
      upcomingEvents: [] as any,
      pastEvents: [] as any
    }
    events.upcomingEvents = upcomingEvents;
    events.pastEvents = pastEvents
    //logger.info("Upcoming events " + upcomingEvents)
    //logger.info("Past events " + pastEvents)
    //logger.info("Events" + events.upcomingEvents)
    return res.send(events);
  }
  catch(e : any){
    logger.error(e)
    return res.status(409).send("User cannot be found.")
  }
}

/*
  Attaches event hosted by the user
*/
export async function attachHostingEventsController(req: Request, res: Response) {
  try{
    logger.info("Now in attachHostingEventsController")

    // This currently breaks attaching the host event
    // const token = req.headers.authorization;
    // const userObject: UserType = JSON.parse(Base64.decode(token ?? ''));
    // const user = await UserModel.findById(userObject._id);

    const token = req.headers.authorization;

    // Decode it and check against mongodb

    const userObject: UserType = JSON.parse(Base64.decode(token ?? ''));
    const userId = userObject['_id'];

    const user = await UserModel.findById(userId);
    logger.info("User is: " + user)

    const eventid = req.query._id?.toString();
    const event = await EventModel.findById(eventid);

    if (event != null && user != null){
        logger.info("Event found : " + event)
        logger.info("Attaching event")
        // Attaches respective event
        user.save(user.hostedEvents.push(event));
	    
        // Recombee integration.
        var recombee = require('recombee-api-client');
        var rqs = recombee.requests;
        var client = new recombee.ApiClient('jarms-dev', 'JZU68AyaIhdPkIVrsKyt4r6XuW24rzxdc15cVfJ1zjt6PcoQxIu6ckCMqtJscNE3');
    
        // Send interactions to recombee database.

          // Adds new item of given eventid to the items catalog. All the item properties for the newly created items are set null.
          await client.send(new rqs.AddItem(eventid));

          // Set property values of a given item of given eventid to facilitate recommendations.
          await client.send(new rqs.SetItemValues(eventid, {
            "type": event.tags,
            "host": event.host,
            "description": event.description.split(' ')
          }));

        return res.sendStatus(200)
    }
    // else if (user == null) {
    //   logger.info("No user found for oid of: " + userid)
    // }
    // else {
    //   logger.info("No event found for tid of: " + eventid)
    // }

  }
  catch(e : any){
    logger.error(e)
    return res.status(409).send(e.message)
  }
}

/* 
  Obtains all hosting events from particular user.
*/
export async function getUserHostingEventsController(req: Request, res: Response){
  try{

    const token = req.headers.authorization;

    // Decode it and check against mongodb

    const userObject: UserType = JSON.parse(Base64.decode(token ?? ''));
    const userId = userObject['_id'];
    const user = await UserModel.findById(userId);
    if (user != null){
      //logger.info("User found : " + user)
    } 
    else{
      //logger.info("No user found for oid of: " + userid)
    }
    
    var pastEvents = new Array();
    const hostedEvents = await UserModel.find(user, 'hostedEvents')
      .populate({path: 'hostedEvents',
                populate: {
                  path: 'reviews',
                  populate: {
                    path: 'reviewer'
                  }
                }
    });
    for (const event of hostedEvents[0].hostedEvents) {
      logger.info("Event:" + event)
      if (moment(event.startDate, "DD MMMM YYYY").isBefore(moment().format('DD MMMM YYYY'))) {
        pastEvents.push(event)
      }  
    }

    logger.info(pastEvents)
    return res.send(pastEvents);
  }
  catch(e : any){
    logger.error(e)
    return res.status(409).send("User cannot be found.")
  }
}

  /* 
    Removes an event from the upcoming events list.
  */
 export async function cancelAttendingEventController(req: Request, res: Response) {
  try{

    const token = req.headers.authorization;
    const userObject: UserType = JSON.parse(Base64.decode(token ?? ''));

    const user = await UserModel.findById(userObject._id);
    const eventid = req.query.eid?.toString();
    const event = await EventModel.findById(eventid)
    if (user != null){
      //logger.info("User found : " + user)
    } 
    else{
      //logger.info("No user found for oid of: " + userid)
    }

    user.save(user.attendingEvents.pop(event));
    // logger.info("event to delete" + doc)
    // logger.info("user id " + userid)
    logger.info("event id " + eventid)
    logger.info("user object: " + user)
  }
  catch(e : any){
    logger.error(e)
    return res.status(409).send("User cannot be found.")
  }
    
}

/* 
    Helper function for submitCommentEventController
    responsible for the insertion of new comment into existing comment data
*/
function updateCommentsObject(comments: any, replyData: any, replyingToID: string) {
    let newComments = "";
    comments = JSON.stringify(comments);
    replyData = JSON.stringify(replyData);

    // find parent comment with matching _id (regex)
    let matchObject = comments.match("\"_id\":" + replyingToID.toString() + "[^]+?comments\":\\[");
    // if a match was found
    if (matchObject && matchObject[0]) {
        // get the index of the end of the regex match (insertion point for new reply)
        let matchEndIndex = matchObject.index + matchObject[0].length;

        // insert new reply into comments data
        newComments = comments.substring(0, matchEndIndex) + replyData;
        // if replying to a comment that already has other replies, add a comma
        if (comments.substring(matchEndIndex, matchEndIndex + 1) !== "]") {
            newComments += ",";
        }
        // add the remainder of the comments after new reply
        newComments += comments.substring(matchEndIndex);
        // console.log(newComments);
        return JSON.parse(newComments);
    }
    
    // if there was any error, return comments unchanged
    return JSON.parse(comments);
}

/* 
    Helper function for submitCommentEventController
    responsible for deleting/anonymising a specified comment 
*/
function anonymiseComment(comments: any, commentDeleteID: any) {
    comments = JSON.stringify(comments);
    let newComments = comments;

    // delete user from comment data
    let userMatchStart = comments.match("\"_id\":" + commentDeleteID.toString() + "[^]+?user\":\"");
    let userMatchEnd = comments.match("\"_id\":" + commentDeleteID.toString() + "[^]+?user\":\"[^]+?\"");
    // only manipulate comments if regex match is found, otherwise leave comments unchanged
    if (userMatchStart && userMatchEnd) {
        let userMatchStartIndex = userMatchStart.index + userMatchStart[0].length;
        let userMatchEndIndex = userMatchEnd.index + userMatchEnd[0].length;
        newComments = comments.substring(0, userMatchStartIndex - 1) + "\"\"" + comments.substring(userMatchEndIndex);
        comments = newComments;
        // console.log(newComments);
    }

    // delete text from comment data
    let textMatchStart = comments.match("\"_id\":" + commentDeleteID.toString() + "[^]+?text\":\"");
    let textMatchEnd = comments.match("\"_id\":" + commentDeleteID.toString() + "[^]+?text\":\"[^]+?\"");
    // only manipulate comments if regex match is found, otherwise leave comments unchanged
    if (userMatchStart && userMatchEnd) {
        let textMatchStartInex = textMatchStart.index + textMatchStart[0].length;
        let textMatchEndIndex = textMatchEnd.index + textMatchEnd[0].length;
        newComments = comments.substring(0, textMatchStartInex - 1) + "\"[comment deleted]\"" + comments.substring(textMatchEndIndex);
        comments = newComments;
        // console.log(newComments);
    }

    return JSON.parse(newComments);
}

/* 
    Helper function for submitCommentEventController
    responsible for editing a specified comment 
*/
function editComment(comments: any, commentEditID: any, newText: any) {
    comments = JSON.stringify(comments);
    let newComments = comments;

    // update text field with newText
    let userMatchStart = comments.match("\"_id\":" + commentEditID.toString() + "[^]+?text\":\"");
    let userMatchEnd = comments.match("\"_id\":" + commentEditID.toString() + "[^]+?text\":\"[^]+?\"");
    // only manipulate comments if regex match is found, otherwise leave comments unchanged
    if (userMatchStart && userMatchEnd) {
        let userMatchStartIndex = userMatchStart.index + userMatchStart[0].length;
        let userMatchEndIndex = userMatchEnd.index + userMatchEnd[0].length;
        newComments = comments.substring(0, userMatchStartIndex - 1) + "\"" + newText + "\"" + comments.substring(userMatchEndIndex);
        // console.log(newComments);
    }

    return JSON.parse(newComments);
}

/* 
    Inserts a new comment, reply, or deletes a comment and updates database for corresponding event
*/
export async function submitCommentEventController(req: Request, res: Response) {
    try {
        const token = req.headers.authorization;
        const userLoggedIn: UserType = JSON.parse(Base64.decode(token ?? ''));
        const userLoggedInID = userLoggedIn['_id'];
    } catch(e: any) {
        return res.status(400).send("Bad token.");
    }

    const eventId = req.query._id?.toString();

    EventModel.findById(eventId, function (err: any, eventData: any) {
        if (err){
            console.log(err);
        }
        else{
            let newComments = "";
            // handle case where a reply is made to an existing comment
            if (req.body.commentType === "reply") {
                // insert at beginning of child comments array
                newComments = updateCommentsObject(eventData.comments, req.body.replyData, req.body.replyingToID);
            // handle case where a new "root" comment is left on the event
            } else if (req.body.commentType === "comment") {
                // insert at beginning of comments object
                let existingComments = JSON.stringify(eventData.comments);
                // check if the comments array was empty before the insertion of this comment
                if (existingComments[1] === "]") {
                    newComments = "[" + JSON.stringify(req.body.commentData) + "]";
                } else {
                    newComments = "[" + JSON.stringify(req.body.commentData) + "," + existingComments.substring(1);
                }
                newComments = JSON.parse(newComments);
            // handle case where comment is "deleted", instead we anonymise the comment to preserve replies
            } else if (req.body.commentType === "delete") {
                newComments = anonymiseComment(eventData.comments, req.body.commentDeleteID);
            } else if (req.body.commentType === "edit") {
                newComments = editComment(eventData.comments, req.body.commentEditID, req.body.newText);
            }

            // Update comments field of current event in database
            EventModel.findByIdAndUpdate(eventId,{"comments": newComments}, function(db_err, db_result){
                if(db_err){
                    console.log(db_err);
                }
                else{
                    console.log(db_result);
                    return res.status(200);
                }
            })
        }
    });

    return res.status(400).send("Failed to write to database");
}

/* 
  Obtains array of emails of attendees of respective event.
*/
export async function getEventAttendeesController(req: Request, res: Response){
  try{
    const eventId = req.query.eid?.toString();

    const event = await EventModel.findById(eventId).populate('tickets');
    
    var attendees = new Array();

    // Loop through tickets of event
    // Excludes duplicate emails
    for (const ticket of event.tickets) {
        if (attendees.includes(ticket.email) == false) {
          attendees.push(ticket.email)
        }
    }

    // Return array of attendee emails.
    return res.send(attendees);
  }
  catch(e : any){
    logger.error(e)
    return res.status(409).send(e.message)
  }
}

/*
  Attaches ticket to the event to track event cancellation.
*/
export async function attachTicketToEventController(req: Request, res: Response) {
  try{
    const eventid = req.query.eid?.toString();
    const event = await EventModel.findById(eventid);

    const ticketid = req.query._id?.toString();
    const ticket = await TicketModel.findById(ticketid);
	  
    const token = req.headers.authorization;
    const userObject: UserType = JSON.parse(Base64.decode(token ?? ''));
    const userId = userObject['_id'];
    const user = await UserModel.findById(userId);

    if (event != null && ticket != null){
        // Attaches respective ticket to event
        event.save(event.tickets.push(ticket));
	    
        // Recombee integration.
        var recombee = require('recombee-api-client');
        var rqs = recombee.requests;
        var client = new recombee.ApiClient('jarms-dev', 'JZU68AyaIhdPkIVrsKyt4r6XuW24rzxdc15cVfJ1zjt6PcoQxIu6ckCMqtJscNE3');

        // Send interactions to recombee database.

          // Adds a purchase of a given event made by a given user.
          await client.send(new rqs.AddPurchase(userId, eventid, {
            'cascadeCreate': true,
          }));
          
          // Attach past history to user to facilitate event recommendation.

              // Event types booked in the past. 
              // An event can be of more than one type.
              for (const i in event.tags) {
                await user.eventTypeHistory.push(event.tags[i])
              }
              
              // Similar descriptions to events that have been booked in the past.
              const descriptionStrings = event.description.split(' ');

              for (const i in descriptionStrings) {
                await user.eventDescriptionHistory.push(descriptionStrings[i])
              }

              // Hosts booked in the past.
              await user.save(user.eventHostHistory.push(event.host))

          // Set property values of a given user.
              await client.send(new rqs.SetUserValues(userId, {
                  "type": user.eventTypeHistory,
                  "host": user.eventHostHistory,
                  "description": user.eventDescriptionHistory,
              }, {
                  'cascadeCreate': true
              }));	    

        return res.sendStatus(200)
    }

  }
  catch(e : any){
    logger.error(e)
    return res.status(409).send(e.message)
  }
}

/*
  Show event recommendations based on event types, hosts booked in the past and similar descriptions.
*/
export async function getEventRecommendationsController(req: Request, res: Response) {
  try {
    const token = req.headers.authorization;
    
    const user: UserType = JSON.parse(Base64.decode(token ?? ''));
    const userId = user['_id'];

    if (token != 'e30=') {
          
        // Recombee integration.
        var recombee = require('recombee-api-client');
        var rqs = recombee.requests;
        var client = new recombee.ApiClient('jarms-dev', 'JZU68AyaIhdPkIVrsKyt4r6XuW24rzxdc15cVfJ1zjt6PcoQxIu6ckCMqtJscNE3');

        // Send interactions to recombee database.

        var recommendedEvents = new Array();

          // Based on user's past purchases with the items, recommends top items that are most likely to be of high value for a given user.
          client.send(new rqs.RecommendItemsToUser(userId, 8, {
              'cascadeCreate': true,
              'scenario': 'Event-Recommendation',
              }),
          async (err, recommendations) => {
            for (const i in recommendations?.recomms) {
              const event = await EventModel.findById(recommendations.recomms[i].id);
              if (event != null) {
                  recommendedEvents.push(event)
              }
            }
            return res.send(recommendedEvents)
          });
    }
  }
  catch(e : any){
    logger.error(e)
    return res.status(409).send(e.message)
  }
}

/* 
  Broadcast a message to all customers that have booked tickets to a given event.
*/
export async function broadcastMessageController(req: Request, res: Response){
  try{
    const eventId = req.query.eid?.toString();
    const event = await EventModel.findById(eventId);

        // Broadcast a message to all customers of your event.
        // Retrieve emails of attendees of respective event.
        await fetch('http://localhost:2102/eventattendees?eid=' + eventId)
        .then(res => res.json())
        .then((data) => {
            if (data != '') {
                sgMail.setApiKey('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')
                const msg = {
                    to: data,
                    from: 'meetic-notification-system@protonmail.com',
                    templateId: 'd-55f6aa3d525a467e80f03f290cd2c6e4',
                    dynamic_template_data: {
                      message: req.body.message,
                      eventid: event._id,
                      eventname: event.title,
                    },
                };
            sgMail.sendMultiple(msg);
            }
        });
    
    return res.send(req.body)
  }
  catch(e : any){
    logger.error(e)
    return res.status(409).send(e.message)
  }
}
