import {Request, Response} from "express"
import { createTicket } from "../service/ticket.service"
import TicketModel from "../db/models/Ticket";
import logger from "../utils/logger"
import sgMail from '@sendgrid/mail';
import UserModel from "../db/models/User";
import moment from "moment";
import { UserType } from "../utils/types";
import { Base64 } from "js-base64";
import EventModel from "../db/models/Event";
import TicketTradeRequestModel from "../db/models/TicketTradeRequest";
import { createTicketTradeRequest } from "../service/tickettraderequest.service";
import mongoose from "mongoose";

/* ========================================================================= //
                              TICKET CONTROLLERS
// ========================================================================= */

/* 
  Creates a ticket.
*/
export async function createTicketController(req: Request<{}, {}>, res: Response){
    // console.log(req.body)
    try{
        const ticket = await createTicket(req.body)

    /*
      Sends an email upon event booking 
      using Twilio SendGrid's v3 Node.js Library
      https://github.com/sendgrid/sendgrid-nodejs
    */
      sgMail.setApiKey('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')
    
      const msg = {
        to: ticket.email,
        from: 'meetic-notification-system@protonmail.com', // Verified sender
        templateId: 'd-655c5376ff4d496cad5411397957219a',
        dynamic_template_data: {
          url: 'http://localhost:3000/ticket/' + ticket._id,
          eventhost: ticket.eventHost,
          eventid: ticket.eid,
          eventdate: ticket.eventDate,
          ticketid: ticket._id,
          eventname: ticket.eventName,
        }
      }
  
      sgMail
        .send(msg)
        .then(() => {
          console.log('Email sent')
        })
        .catch((error) => {
          console.error(error)
        })

        return res.send(ticket.toJSON());
    }
    catch(e : any) {
    logger.error(e)
    return res.status(409).send(e.message)
    }
 }

/* 
  Obtains all tickets from db.
*/
export async function getTicketsController(req: Request, res: Response){
  try{
    /*
      Gets tickets, and sends back a response.
    */
    const tickets = await TicketModel.find();
    return res.send(tickets);
  }
  catch(e : any){
    logger.error(e)
    return res.status(409).send(e.message)
  }
}

/* 
  Obtains a ticket from db based on tid in url params/headers.
*/
export async function getSingleTicketController(req: Request, res: Response){
  try{

    const ticketid = req.query._id?.toString();
           
    // if (ticketid == undefined || ticketid.length < 24 || ticketid.length > 24) {
    //   return;
    // }

    const ticket = await TicketModel.findById(ticketid);
    if (ticket != null){
      logger.info("Ticket found : " + ticket)
      return res.send(ticket);
    } 
    else{
      logger.info("No ticket found for tid of: " + ticketid)
    }

  }
  catch(e : any){
    logger.error(e)
    return res.status(409).send("Ticket cannot be found.")
  }
}

/* 
  Verifies a ticket from db based on tid in url params/headers.
*/
export async function verifyTicketController(req: Request, res: Response){
  try{

    const ticketid = req.query._id?.toString();
    const ticket = await TicketModel.findById(ticketid);
    if (ticket != null){
      logger.info("Ticket found : " + ticket)

      // Updates verified boolean on respective ticket
      ticket.save(ticket.verified = true);
    } 
    else{
      logger.info("No ticket found for tid of: " + ticketid)
    }

    return res.send(ticket);
  }
  catch(e : any){
    logger.error(e)
    return res.status(409).send("Ticket cannot be found.")
  }
}

/* 
  Cancels a ticket from db based on tid in url params/headers and remove attendee using token.
*/
export async function cancelTicketController(req: Request, res: Response){
    try{
        
        const ticketid = req.query._id?.toString();
        const ticket = await TicketModel.findById(ticketid);

        const token = req.headers.authorization;
        const userObject: UserType = JSON.parse(Base64.decode(token ?? ''));
    
        const user = await UserModel.findById(userObject._id);

        const eventid = req.query.eid?.toString();
        const event = await EventModel.findById(eventid).populate("attendees")

        if (ticket != null){
            logger.info("Ticket found : " + ticket)

            // Cancels respective ticket
            event.tickets.pop(ticket)
            ticket.delete();
            // Pop user from attendees list
            event.save(event.attendees.pop(user))
          
            // Recombee integration.
            var recombee = require('recombee-api-client');
            var rqs = recombee.requests;
            var client = new recombee.ApiClient('jarms-dev', 'JZU68AyaIhdPkIVrsKyt4r6XuW24rzxdc15cVfJ1zjt6PcoQxIu6ckCMqtJscNE3');

            // Remove past history to user to refine event recommendation.

            // Event types booked in the past. 
            // An event can be of more than one type.
            for (const i in event.tags) {
                await user.eventTypeHistory.pop(event.tags[i])
            }
              
            // Similar descriptions to events that have been booked in the past.
            const descriptionStrings = event.description.split(' ');

            for (const i in descriptionStrings) {
                await user.eventDescriptionHistory.pop(descriptionStrings[i])
            }

            // Hosts booked in the past.
            await user.save(user.eventHostHistory.pop(event.host))

            // Set property values of a given user.
            await client.send(new rqs.SetUserValues(userObject._id, {
                "type": user.eventTypeHistory,
                "host": user.eventHostHistory,
                "description": user.eventDescriptionHistory,
            }, {
                'cascadeCreate': true
            }));            

            return res.sendStatus(200)
        } 
        else{
            logger.info("No ticket found for tid of: " + ticketid)
        }

    }
    catch(e : any){
        logger.error(e)
        return res.status(409).send("Ticket cannot be found.")
    }
}

/* 
  Obtains all tickets from particular user.
*/
export async function getUserTicketsController(req: Request, res: Response){
  try{

    const token = req.headers.authorization;
    const userObject: UserType = JSON.parse(Base64.decode(token ?? ''));

    const user = await UserModel.findById(userObject._id);
    if (user != null){
      logger.info("User found : " + user)
    } 
    else{
      logger.info("No user found for oid of: " + userObject)
    }

    // const tickets = await TicketModel.find().populate('');
    const tickets = await UserModel.find(user, 'tickets').populate('tickets');

    return res.send(tickets[0].tickets);
  }
  catch(e : any){
    logger.error(e)
    return res.status(409).send("User cannot be found.")
  }
}

/* 
  Attaches a ticket to a user.
*/
export async function attachTicketsController(req: Request, res: Response){
  try{

    const token = req.headers.authorization;
    const userObject: UserType = JSON.parse(Base64.decode(token ?? ''));

    const user = await UserModel.findById(userObject._id);

    const ticketid = req.query._id?.toString();
    const ticket = await TicketModel.findById(ticketid);

    if (ticket != null && user != null){
        logger.info("User found : " + user)
        logger.info("Ticket found : " + ticket)

        // Attaches respective ticket
        user.save(user.tickets.push(ticket));

        return res.sendStatus(200)
    }
    else if (user == null) {
      logger.info("No user found for oid of: " + userObject)
    }
    else {
      logger.info("No ticket found for tid of: " + ticketid)
    }

  }
  catch(e : any){
    logger.error(e)
    return res.status(409).send(e.message)
  }
}

/* 
  Attaches a payment ID to a ticket from db based on tid in url params/headers.
*/
export async function attachPaymentIDController(req: Request, res: Response){
  try{

    const ticketid = req.query._id?.toString();
    const ticket = await TicketModel.findById(ticketid);

    const paymentID = req.query.paymentID?.toString()

    if (ticket != null){
      logger.info("Ticket found : " + ticket)

      // Attaches payment ID to respective ticket
      ticket.save(ticket.paymentID = paymentID);
    } 
    else{
      logger.info("No ticket found for tid of: " + ticketid)
    }

    return res.send(ticket);
  }
  catch(e : any){
    logger.error(e)
    return res.status(409).send("Ticket cannot be found.")
  }
}

/* 
  Obtains all tickets from particular user that are sorted into past and upcoming ticket arrays.
*/
export async function getSortedUserTicketsController(req: Request, res: Response){
  try{
    const token = req.headers.authorization;
    const userObject: UserType = JSON.parse(Base64.decode(token ?? ''));
    let user;

    // get sorted ticket information from user specified in request params
    // if no user is specified, get logged in user's ticket information
    if (req.query.uid) {
        logger.info("req.query.uid exists");
        user = await UserModel.findById(req.query.uid);
    } else {
        logger.info("req.query.uid does not exist");
        user = await UserModel.findById(userObject._id);
    }

    if (user != null){
        logger.info("User found : " + user)
    } 
    else{
        logger.info("No user found for oid of: " + userObject)
    }

    const tickets = await UserModel.find(user, 'tickets').populate('tickets');

    var currentDate = moment().format('DD MMMM YYYY')
    var upcomingTickets = new Array();
    var pastTickets = new Array();

    // Loop through each ticket of the user and check if the current date is before the starting date
    for (const ticket of tickets[0].tickets) {
        var ticketStartDate = moment(ticket.eventDate).format('DD MMMM YYYY')
      if (moment(ticketStartDate).isSameOrAfter(currentDate)) {
          upcomingTickets.push(ticket)
      } else {
          pastTickets.push(ticket)
      }
    }

    let userTickets = {
      upcomingTickets: [] as any,
      pastTickets: [] as any
    }

    userTickets.upcomingTickets = upcomingTickets;
    userTickets.pastTickets = pastTickets

    return res.send(userTickets);
    
  }
  catch(e : any){
    logger.error(e)
    return res.status(409).send("User cannot be found.")
  }
}

/* 
  Obtains array of payment IDs of tickets for a respective event to track refunds.
*/
export async function getTicketRefundsController(req: Request, res: Response){
  try{
    const eventId = req.query.eid?.toString();

    const event = await EventModel.findById(eventId).populate('tickets');
    
    var paymentIDs = new Array();

    // Loop through tickets of event
    for (const ticket of event.tickets) {
        if (ticket.paymentID != null) {
            paymentIDs.push(ticket.paymentID)
        }
    }

    // Return array of payment IDs to track refunds.
    return res.send(paymentIDs);
  }
  catch(e : any){
    logger.error(e)
    return res.status(409).send("User cannot be found.")
  }
}


/* ========================================================================= //
                          TICKET TRADE CONTROLLERS
// ========================================================================= */

/* 
  create a ticket trade request
*/
export async function createTicketTradeRequestController(req: Request, res: Response) {
    console.log("Creating Ticket Trade Request:")

    const token = req.headers.authorization;
    const userLoggedIn: UserType = JSON.parse(Base64.decode(token ?? ""));
    const userLoggedInID = userLoggedIn["_id"];

    try {
        const ticketTradeRequest = await createTicketTradeRequest(req.body)
        return res.send(ticketTradeRequest.toJSON());
    } catch (e: any) {
        logger.error(e)
        return res.status(409).send(e.message);
    }
}

/* 
  Obtains all ticket trade requests from the db
*/
export async function getTicketTradeRequestsController(req: Request, res: Response) {
    try {
        // get all ticket trade requests and populate their fields
        const ticketTradeRequests = await TicketTradeRequestModel.find().populate("offeredTicket").populate("requestedTicket");
        return res.send(ticketTradeRequests);
    } catch (e: any) {
        logger.error(e);
        return res.status(409).send(e.message);
    }
}

/* 
  Obtains ticket trade data from the db for a specified user
*/
export async function getUserTicketTradeDataController(req: Request, res: Response) {
    logger.info("Fetching Ticket Trade Data");
    try {
        const user = await UserModel.findById(req.query.uid);
        if (user != null) {
            logger.info("User found : " + user)
        }
        else {
            logger.info("No user found for uid of: " + req.query.uid);
        }

        const allTicketTrades = await TicketTradeRequestModel.find().populate("offeredTicket").populate("requestedTicket");
        var outgoing = new Array();
        var incoming = new Array();

        // Loop through each ticket trade request to find incoming and outgoing requests involving the user

        for (const ticketTrade of allTicketTrades) {
            if (ticketTrade.requestedTicket.uid === req.query.uid) {
                incoming.push(ticketTrade);
            }
            if (ticketTrade.offeredTicket.uid === req.query.uid) {
                outgoing.push(ticketTrade);
            }
        }

        let userTicketTradeData = {
            incoming: [] as any,
            outgoing: [] as any,
        }

        userTicketTradeData.incoming = incoming;
        userTicketTradeData.outgoing = outgoing;

        return res.send(userTicketTradeData);

    }
    catch (e: any) {
        logger.error(e);
        return res.status(409).send("User cannot be found.");
    }
}

/* 
  Deletes a single specified ticket trade request from the db
*/
export async function deleteTicketTradeRequestController(req: Request, res: Response) {
    try {
        const tradeRequst_id = req.query._id?.toString();
        const tradeRequest = await TicketTradeRequestModel.findById(tradeRequst_id);
        if (tradeRequest != null) {
            logger.info("Ticket Trade Request found : " + tradeRequest);

            // delete the ticket trade request
            tradeRequest.delete();

            return res.sendStatus(200);
        }
        else {
            logger.info("No Ticket Trade Request found for _id of: " + tradeRequst_id);
        }

    }
    catch (e: any) {
        logger.error(e);
        return res.status(409).send("Ticket Trade Request cannot be found.");
    }
}

/* 
  Execute a specified ticket trade request
*/
export async function executeTicketTradeRequestController(req: Request, res: Response) {
    logger.info(req.body);
    try {
        const tradeRequst_id = req.body._id;
        const tradeRequestObject = await TicketTradeRequestModel.findById(tradeRequst_id);
        if (tradeRequestObject != null) {
            logger.info("Ticket Trade Request found : " + tradeRequestObject);

            const offeredTicketObject = await TicketModel.findById(req.body.offeredTicket._id);
            const requestedTicketObject = await TicketModel.findById(req.body.requestedTicket._id);

            // update user "tickets" field to reflect new ticket ownership
            await UserModel.updateOne({_id: req.body.offeredTicket.uid}, {$push: {tickets: req.body.requestedTicket._id}});
            await UserModel.updateOne({_id: req.body.requestedTicket.uid}, {$pull: {tickets: req.body.requestedTicket._id}});
            await UserModel.updateOne({_id: req.body.requestedTicket.uid}, {$push: {tickets: req.body.offeredTicket._id}});
            await UserModel.updateOne({_id: req.body.offeredTicket.uid}, {$pull: {tickets: req.body.offeredTicket._id}});
            
            // note: might need to update user "attendingEvents" field, but appears to be unused

            // update ticket "uid" and "email" fields to reflect new ticket ownership
            await TicketModel.updateOne({_id: req.body.offeredTicket._id}, {uid: req.body.requestedTicket.uid, email: req.body.requestedTicket.email});
            await TicketModel.updateOne({_id: req.body.requestedTicket._id}, {uid: req.body.offeredTicket.uid, email: req.body.offeredTicket.email});

            // update event "attendees" field to reflect new ticket ownership
            await EventModel.updateOne({_id: req.body.offeredTicket.eid}, {$push: {attendees: req.body.requestedTicket.uid}});
            await EventModel.updateOne({_id: req.body.offeredTicket.eid}, {$pull: {attendees: req.body.offeredTicket.uid}});
            await EventModel.updateOne({_id: req.body.requestedTicket.eid}, {$push: {attendees: req.body.offeredTicket.uid}});
            await EventModel.updateOne({_id: req.body.requestedTicket.eid}, {$pull: {attendees: req.body.requestedTicket.uid}});

            // remove all active ticket trades that involve either offeredTicket or requestedTicket
            await TicketTradeRequestModel.deleteMany({ $or:[ 
                {offeredTicket: offeredTicketObject}, 
                {offeredTicket: requestedTicketObject}, 
                {requestedTicket: offeredTicketObject}, 
                {requestedTicket: requestedTicketObject} ] });

            return res.sendStatus(200);
        }
        else {
            logger.info("No Ticket Trade Request found for _id of: " + tradeRequst_id);
        }

    }
    catch (e: any) {
        logger.error(e);
        return res.status(409).send("Ticket Trade Request cannot be found.");
    }
}