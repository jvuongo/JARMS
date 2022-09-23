import { Request, Response } from "express";
import { omit } from "lodash";
import { CreateUserPayload } from "../schema/user.schema";
import { createUser } from "../service/user.service";
import logger from "../utils/logger";
import EventModel from "../db/models/Event";
import UserModel from "../db/models/User";
import { getUsersController } from "./user.controller";
import ReviewModel from "../db/models/Review";
import { UserType } from "../utils/types";
import { Base64 } from "js-base64";

interface CreateReviewInput {
    eid: string,
    reviewer: string,
    review: string,
    rating: number
  }

/* ========================================================================= //
                              REVIEW CONTROLLER
// ========================================================================= */


/*
  TODO: Need to somehow update the relevant event reviews array after creating the review.
    I think it would be Event.findByIdAndUpdate()
*/

/* 
  Obtains all reviews from db.
*/
export async function getReviewsController(req: Request, res: Response) {
  try {
    const reviews = await ReviewModel.find().populate("eid").populate("reviewer");
    if (reviews != null) {
      logger.info("get reviews successful!");
    } else {
      logger.info("get reviews failed.");
    }
    return res.send(reviews);
  } catch (e: any) {
    logger.error(e);
    return res.status(409).send("No reviews");
  }
}

/*
Obtains reviews written by the current user
*/

export async function getUserReviewsController(req: Request, res: Response) {
  /*
    First get the current user and all the events including their reviews
    For every event, check all their reviews
    If a review has a reviewer == user, then push it to reviews array
  */
  try {
    const token = req.headers.authorization;
    const userLoggedIn: UserType = JSON.parse(Base64.decode(token ?? ''));
    const userLoggedInID = userLoggedIn['_id'];
    
    if (req.query.uid) {
       var user = await UserModel.findById(req.query.uid)
    } else{
       var user = await UserModel.findById(userLoggedInID)
    }
  
    try {
      const events = await EventModel.find().populate("reviews")
      .populate({path: "reviews",
                 populate: {
                   path: 'eid'
                 }            
    })

      var userReviews = new Array();
      

      for (const event of events) {
        for (const review of event.reviews) {
          logger.info("Checking review: " + review)
          logger.info("type user id " + user._id)
          logger.info("type reviewer id " + review.reviewer)
          if (String(review.reviewer).trim() === String(user._id).trim()) {
            logger.info("Found existing review" + review)
            userReviews.push(review) 
          }
        }
      }

      return res.send(userReviews)
    }
    catch (e: any) {
        logger.error(e);
        return res.status(409).send("User cannot be found.");
    }
  } catch (e: any) {
      return res.status(400).send("Bad token.");
  }

}

/* 
  Create a review
*/
export async function createReviewController(
    req: Request<{}, {}>,
    res: Response
  ) {
    try {
      /*
        Creates a user, and sends back a response.
        req.body is CreateUserPayload["body"].
      */
      const payload: CreateReviewInput = req.body;
  
      // Fetch host profile
      const user = await UserModel.findById(payload.reviewer);
      if (user != null) {
        //logger.info("User found : " + user);
      } else {
        //logger.info("No user found for oid of: " + user);
      }
  
      try {
        const review = await ReviewModel.create({
          eid: payload.eid,
          reviewer: payload.reviewer,
          review: payload.review,
          rating: payload.rating,
        });

        logger.info("Review created " + review)

        return res.send(review.toJSON())
      } catch (e: any) {
        throw new Error(e);
      }
    } catch (e: any) {
      logger.error(e);
      return res.status(409).send(e.message);
    }
  }

  // This controller is a test to see if I can update the event with a review
  // This should be the same code for adding tickets by Andrew.
  export async function attachReviewController(req: Request, res: Response) {
    try{
  
      const eventid = req.query.eid?.toString();
      const event = await EventModel.findById(eventid).populate('reviews')
      const reviewid = req.query.rid?.toString();
      const review = await ReviewModel.findById(reviewid);
      
      logger.info("eventid " + eventid)
      logger.info("reviewid " + reviewid)
      if (review != null && event != null){
  
          // Attaches respective review
          await event.save(event.reviews.push(review));

          // Get reviews of event
          const reviews = await ReviewModel.find({eid: eventid}).populate("reviewer");

          // If theres only 1 review
          if (reviews.length == 1){
            // Set the event rating to the review rating
            const average = event.rating = reviews[0].rating;
            await event.save(event.avgRating = average)

          } else {
            // Get average rating of all reviews
            var total = 0;
            for (const review of reviews) {
              total += review.rating;
            }
            var average = total / reviews.length;
            await event.save(event.avgRating = average)
          }

          logger.info("Event found : " + event)
          
          // Change the avgRating of the host
          /*
            1. Get the host 
            2. Get the hosts hostedEvents, loop through each event and store the avg rating in an array? => This doesn't have be done this way
            3. Get the length of the array = size2
            4. Add the avg ratings = totalAvgRatings
            5. hostAvgRating = totalAvgRatings / size2
            6. user.save(user.avgRating = hostAvgRating)
            
          */
          // Note: The default event rating is 0 so the host's average rating will be inaccurate
          const user = await UserModel.findById(event.host._id).populate('hostedEvents')
          // Get reviews of event
          const hostReviews = await ReviewModel.find().populate('eid');

          // Filter host Reviews with _id matching user._id
          const hostReviewsFiltered = hostReviews.filter(review => review.eid.host._id.toString() == user._id.toString());

          // If theres only 1 review
          if (hostReviewsFiltered.length == 1){
            // Set the event rating to the review rating
            const average =  hostReviewsFiltered[0].rating;
            await user.save(user.avgRating = average)

          } else {
            // Get average rating of all reviews
            var total = 0;
            for (const review of hostReviewsFiltered) {
              total += review.rating;
            }
            var average = total / reviews.length;
            await user.save(user.avgRating = average)
          }

          return res.sendStatus(200)
      }
      else if (event == null) {
        logger.info("No event found for tid of: " + eventid)
      } else {
        logger.info("Review not found")
      }
  
    }
    catch(e : any){
      logger.error(e)
      return res.status(409).send(e.message)
    }
  }
