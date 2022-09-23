import mongoose from "mongoose"

/*
    Type interface.
*/
export interface TicketDocument {
    eid: String;
    email: String;
    eventDate: String;
    eventHost: String;
    eventName: String;
    verified: Boolean, default: false;
    paymentID: String
}

const ticketSchema = new mongoose.Schema({
    eid:  {
        type: String
    },
    uid: {
        type: String
    },
    email: {
        type: String
    },
    eventDate:  {
        type: String
    },
    eventHost:  {
        type: String
    },
    eventName:  {
        type: String
    },
    verified:  {
        type: Boolean, default: false
    },
    paymentID:  {
        type: String, default: null
    }
})

/*
    Ticket Model
*/
const TicketModel = mongoose.model("Ticket", ticketSchema)
export default TicketModel;
