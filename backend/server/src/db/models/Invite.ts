import mongoose from "mongoose"
import bcrypt from "bcrypt"

const config = require("config")

/*
    Event Invite
*/
const eventInviteSchema = new mongoose.Schema(
    {
        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event",
        },
        from: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        to: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        status: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true
    }
)

/*
    Friend Invite 
*/
const friendInviteSchema = new mongoose.Schema(
    {
        from: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        to: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        status: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true
    }
)

/*
    Friend Invite 
*/
const tradeRequestSchema = new mongoose.Schema(
    {
        fromTicket: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Ticket',
            required: true
        },
        toTicket: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Ticket',
            required: true
        },
        from: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        to: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        status: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true
    }
)


/*
    Invite Models
*/
export const EventInviteModel = mongoose.model("EventInviteModel", eventInviteSchema)
export const FriendInviteModel = mongoose.model("FriendInviteModel", friendInviteSchema)
export const TradeRequestModel = mongoose.model("TradeRequestModel", tradeRequestSchema)
