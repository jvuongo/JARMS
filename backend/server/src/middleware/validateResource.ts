import { Request, Response, NextFunction } from "express";
import { AnyZodObject } from "zod";

/*
  Middleware for validating the body of POST endpoints.
  Uses zod for validation purposes.
  Takes in a schema and validates it.
*/

const validate = (schema: AnyZodObject) => (req: Request, res: Response, next:NextFunction) => {
  try{
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params
    });
    // If above passes, go to next function, i.e next middleware
    next();
  } catch(e: any){
    return res.status(400).send(e.errors);
  }
}

export default validate;