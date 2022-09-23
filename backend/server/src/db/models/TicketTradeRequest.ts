import mongoose from "mongoose"

/*
    Schema for ticket trade requests
*/

const ticketTradeRequestSchema = new mongoose.Schema({
    offeredTicket:  {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket',
        required: true
    },
    requestedTicket: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket',
        required: true
    }
})

/*
    Ticket Model
*/
const TicketTradeRequestModel = mongoose.model("TicketRequest", ticketTradeRequestSchema)
export default TicketTradeRequestModel;
