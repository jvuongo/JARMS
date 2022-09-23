import { Express, Request, Response } from "express";
import validateResource from "../middleware/validateResource";
import tokenValidator from "../middleware/tokenValidator";
import {
  createUserSchema,
  loginSchema,
  resetPasswordSchema,
} from "../schema/user.schema";
import {
  createUserController,
  getSingleUserController,
  getUsersController,
  verifyUserController,
  resetPasswordLinkController,
  resetPasswordController,
  getAllUserNameController,
  updateAvatarController,
  getMeController,
  updateMeController,
  getCurrentUserController,
  getFriendsController,
} from "../controller/user.controller";
import { createTicketSchema } from "../schema/ticket.schema";
import {
  attachPaymentIDController,
  attachTicketsController,
  cancelTicketController,
  createTicketController,
  getSingleTicketController,
  getSortedUserTicketsController,
  getTicketRefundsController,
  getTicketsController,
  getUserTicketsController,
  verifyTicketController,
  createTicketTradeRequestController,
  getTicketTradeRequestsController,
  getUserTicketTradeDataController,
  deleteTicketTradeRequestController,
  executeTicketTradeRequestController,
} from "../controller/ticket.controller";
import { loginController } from "../controller/login.controller";
import {
  acceptFriendRequestController,
  getFriendRecommendationsController,
  getFriendsController,
  getSocialsController,
  removeFriendController,
  sendFriendRequestController,
  declineEventInviteController,
  declineFriendRequestController,
  acceptEventInviteController
} from "../controller/socials.controller";
import {
  getEventsController,
  getSingleEventController,
  createEventController,
  getMyEventsController,
  attachHostingEventsController,
  getUserAttendingEventsController,
  getUserHostingEventsController,
  cancelAttendingEventController,
  deleteMyEventController,
  deleteEventController,
  submitCommentEventController,
  attachTicketToEventController,
  getEventAttendeesController,
  attachAttendeeController,
  getEventRecommendationsController,
  broadcastMessageController,
} from "../controller/event.controller";
import {
  getReviewsController,
  createReviewController,
  attachReviewController,
  getUserReviewsController,
} from "../controller/review.controller";

function routes(app: Express) {
  app.get("/status", (req: Request, res: Response) => res.sendStatus(200));

  /*
    Endpoint for creating a user.
    ValidateResource is the first middleware which when successful calls next() 
    and runs createUserController.
    - Does not create a user in users collection
    - instead appends to a pendingVerification collection
    - sends an email with payload encoded
  */
  app.post("/users", validateResource(createUserSchema), createUserController);

  /*
    Endpoint to verify a user
    - prevent accounts with fake emails from populating our database
    - confirms the user is authentic by sending an email to user with verify button (which has payload 
      embedded, using encoding)
    - removes user email from pendingVerification collection
  */
  app.get("/userVerification", verifyUserController);

  /*
    Endpoint for sending a rest password link
  */
  app.post("/userResetPasswordLink", resetPasswordLinkController);

  /*
    Endpoint for resetting password for a user
    - check if password equal
    - check if >= to 8 characters
  */
  app.post(
    "/userResetPassword",
    validateResource(resetPasswordSchema),
    resetPasswordController
  );

  /*
    Endpoint for getting all users.
  */
  app.get("/users", getUsersController);

  /*
    Endpoint for getting logged in user info
  */
  app.get("/me", getMeController);

  /*
    Endpoint for updating logged in user info
  */
  app.post("/me", updateMeController);

  /*
    Endpoint for getting a single user based on uid or oid in mongodb.
  */
  app.get("/user", tokenValidator, getSingleUserController);

  /*
    Endpoint for getting current user
 */
  app.get("/currentuser", tokenValidator, getCurrentUserController);

  /*
    Endpoint for creating a ticket.
  */
  app.post(
    "/tickets",
    validateResource(createTicketSchema),
    createTicketController
  );

  /*
    Endpoint for getting all tickets.
  */
  app.get("/tickets", getTicketsController);

  /*
    Endpoint for getting a single ticket based on tid in mongodb.
  */
  app.get("/ticket", getSingleTicketController);

  /*
    Endpoint for verifying a single ticket based on tid in mongodb.
  */
  app.patch("/ticket", verifyTicketController);

  /*
    Endpoint for cancelling a single ticket based on tid in mongodb and pop the attendee from event.
  */
  app.delete("/ticket", cancelTicketController);

  /*
    Endpoint for getting all tickets belonging to a user based on uid or oid in mongodb.
  */
  app.get("/usertickets", getUserTicketsController);

  /*
    Endpoint for attaching tickets to a user based on uid or oid in mongodb.
  */
  app.patch("/attachticket", tokenValidator, attachTicketsController);

  /*
    Endpoint for getting all tickets belonging to a user based on uid or oid in mongodb sorted into past and upcoming ticket arrays.
  */
  app.get("/sortusertickets", getSortedUserTicketsController);

  /*
    Endpoint for attaching a payment ID to a single ticket based on tid in mongodb.
  */
  app.patch("/payment", tokenValidator, attachPaymentIDController);

  /*
    Endpoint for getting a list of payment IDs to track refunds
  */
  app.get("/payments", getTicketRefundsController);

  /*
    Endpoint for attaching a ticket to an event to track event cancellation.
  */
  app.patch("/attendevent", attachTicketToEventController);

  /*
    Endpoint for creating a ticket trade request
  */
  app.post("/tickettrade", tokenValidator, createTicketTradeRequestController);

  /*
    Endpoint for getting all ticket trade requests
  */
  app.get("/tickettrades", tokenValidator, getTicketTradeRequestsController);

  /*
    Endpoint for getting ticket trade data for a specified user
  */
  app.get(
    "/usertickettrades",
    tokenValidator,
    getUserTicketTradeDataController
  );

  /*
    Endpoint for deleting a single specified ticket trade request
  */
  app.delete(
    "/tickettrade",
    tokenValidator,
    deleteTicketTradeRequestController
  );

  /*
    Endpoint for executing a ticket trade request
  */
  app.patch(
    "/tickettrade",
    tokenValidator,
    executeTicketTradeRequestController
  );

  /*
    Endpoint for getting all event attendees
  */
  app.get("/eventattendees", getEventAttendeesController);

  /*
    Endpoint for broadcasting a message to all customers of an event.
  */
  app.post("/broadcast", broadcastMessageController);

  /*
    Endpoint for getting all events.
    For guests.
  */
  app.get("/events", getEventsController);

  /*
    Endpoint for getting recommended events.
  */
  app.get("/recommendedevents", getEventRecommendationsController);

  /*
    Endpoint for getting a single event based on eid or oid in mongodb.
  */
  app.get("/event", getSingleEventController);

  /*
    Endpoint for creating an event
  */
  app.post("/events", createEventController);

  /*
    Endpoint for deleting a single specified event
  */
  app.delete("/event", deleteEventController);

  /*
    Endpoint for storing new comment in event data structure
  */
  app.patch("/event", submitCommentEventController);

  /*
    Endpoint for sign in
  */
  app.post("/login", validateResource(loginSchema), loginController);

  /*
    Endpoint for getting all reviews
  */
  app.get("/reviews", getReviewsController);

  /*
    Endpoint for getting a review by the current user for a specific event
  */
  app.get("/userreviews", getUserReviewsController);
  /*
    Endpoint for creating a review
  */
  app.post("/reviews", createReviewController);

  /*
    Endpoint for attaching a review to an event based on eid in mongodb
  */
  app.patch("/attachreview", tokenValidator, attachReviewController);
  /*
    Endpoint for attaching an attending event to a user based on uid in mongodb
  */
  app.patch("/attachuser", tokenValidator, attachAttendeeController);

  /*
    Endpoint for getting events attended by the user based on uid or oid in mongodb.
  */
  app.get("/userevents", tokenValidator, getUserAttendingEventsController);

  /*
    Endpoint for attaching events hosted by the user based on uid in mongodb
  */
  app.patch("/attachhostevents", tokenValidator, attachHostingEventsController);

  /*
    Endpoint for cancelling an event they were suppose to attend based on eid in mongodb.
  */
  app.patch("/removeevent", tokenValidator, cancelAttendingEventController);

  /*
    Endpoint for getting events hosted by the user based on uid or oid in mongodb.
  */
  app.get("/hostevents", getUserHostingEventsController);
  app.get("/social", getSocialsController);

  /**
   * Get my events
   */
  app.get("/myevents", getMyEventsController);

  app.delete("/myevent", deleteMyEventController);

  /**
   * Send friend request
   */
  app.post("/friends/add", sendFriendRequestController);

  /**
   * Accept friend request
   */
  app.post("/friends/accept", acceptFriendRequestController);

    /**
   * Accept event invite
   */
     app.post("/event/accept", acceptEventInviteController);

  /**
   * remove friend
   */
  app.post("/friends/remove", removeFriendController);

  /**
   * Get friend recommendations
   */
  app.get("/recommendedfriends", getFriendRecommendationsController);

  /**
   * Getting all friends
   */
  app.get("/friends", getFriendsController);
  app.post("/avatar", updateAvatarController);

  /**
   * Decline friend request
   */
  app.post("/friends/decline", declineFriendRequestController);

  /**
   * Decline event invite
   */
  app.post("/event/decline", declineEventInviteController);
}

export default routes;
